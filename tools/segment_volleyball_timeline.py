#!/usr/bin/env python3
import argparse
import csv
import itertools
import json
import pathlib

import numpy as np


def fmt_time(seconds):
    seconds = float(seconds)
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:05.2f}"


def read_timeline(path):
    rows = []
    with path.open() as f:
        for row in csv.DictReader(f):
            rows.append(
                {
                    "second": int(row["second"]),
                    "visual_motion": float(row["visual_motion"]),
                    "audio_rms": float(row["audio_rms"]),
                    "visual_contrast": float(row["visual_contrast"]),
                }
            )
    return rows


def rolling_mean(values, window):
    if window <= 1:
        return values.copy()
    kernel = np.ones(window, dtype=np.float32) / window
    return np.convolve(values, kernel, mode="same")


def robust_norm(values):
    arr = np.asarray(values, dtype=np.float32)
    med = np.nanmedian(arr)
    q1 = np.nanpercentile(arr, 25)
    q3 = np.nanpercentile(arr, 75)
    iqr = max(q3 - q1, 1e-6)
    return np.clip((arr - med) / iqr, 0, 8)


def boolean_segments(mask, min_len=1, pad=0, max_gap=0):
    mask = np.asarray(mask, dtype=bool)
    if max_gap > 0:
        true_idx = np.flatnonzero(mask)
        if true_idx.size:
            filled = mask.copy()
            last = true_idx[0]
            for idx in true_idx[1:]:
                if idx - last - 1 <= max_gap:
                    filled[last + 1 : idx] = True
                last = idx
            mask = filled
    segments = []
    start = None
    for i, value in enumerate(mask):
        if value and start is None:
            start = i
        elif not value and start is not None:
            if i - start >= min_len:
                segments.append((max(0, start - pad), min(len(mask), i + pad)))
            start = None
    if start is not None and len(mask) - start >= min_len:
        segments.append((max(0, start - pad), len(mask)))
    return segments


def candidate_quiet_valleys(score, window=60, percentile=15, min_len=60):
    smooth = rolling_mean(score, window)
    threshold = float(np.nanpercentile(smooth, percentile))
    valleys = []
    for start, end in boolean_segments(smooth < threshold, min_len=min_len):
        avg = float(np.nanmean(smooth[start:end]))
        depth = max(0.0, threshold - avg)
        valleys.append(
            {
                "start_time": start,
                "end_time": end,
                "start": fmt_time(start),
                "end": fmt_time(end),
                "duration": end - start,
                "avg_score": round(avg, 4),
                "transition_score": round((end - start) * depth, 4),
            }
        )
    return valleys


def choose_expected_game_valleys(valleys, total_seconds, expected_games):
    internal = [
        v
        for v in valleys
        if v["start_time"] > 10 * 60 and v["end_time"] < total_seconds - 5 * 60
    ]
    terminal = [
        v
        for v in valleys
        if v["start_time"] > total_seconds - 15 * 60 and v["duration"] >= 120
    ]
    terminal_end = terminal[-1]["start_time"] if terminal else total_seconds
    needed = expected_games - 1
    if len(internal) < needed:
        return internal, terminal_end

    best = None
    target = terminal_end / expected_games
    for combo in itertools.combinations(range(len(internal)), needed):
        selected = [internal[i] for i in combo]
        cuts = [int((v["start_time"] + v["end_time"]) / 2) for v in selected]
        bounds = [0] + cuts + [terminal_end]
        lengths = [bounds[i + 1] - bounds[i] for i in range(expected_games)]
        if min(lengths) < 10 * 60:
            continue
        transition_strength = sum(v["transition_score"] for v in selected)
        short_penalty = sum(max(0, 15 * 60 - length) / 10 for length in lengths)
        long_penalty = sum(max(0, length - 55 * 60) / 30 for length in lengths)
        balance_penalty = sum(abs(length - target) / max(target, 1) for length in lengths) * 2
        score = transition_strength - short_penalty - long_penalty - balance_penalty
        candidate = (score, selected)
        if best is None or candidate[0] > best[0]:
            best = candidate
    if best:
        return best[1], terminal_end
    selected = sorted(internal, key=lambda v: v["transition_score"], reverse=True)[:needed]
    return sorted(selected, key=lambda v: v["start_time"]), terminal_end


def split_long_segment(start, end, score, quiet_threshold, min_gap=240):
    quiet = score[start:end] < quiet_threshold
    gaps = boolean_segments(quiet, min_len=min_gap)
    if not gaps:
        return [(start, end)]
    pieces = []
    cursor = start
    for gap_start, gap_end in gaps:
        absolute_gap_start = start + gap_start
        absolute_gap_end = start + gap_end
        if absolute_gap_start - cursor > 300:
            pieces.append((cursor, absolute_gap_start))
        cursor = absolute_gap_end
    if end - cursor > 300:
        pieces.append((cursor, end))
    return pieces


def infer_segments(rows, expected_games=None):
    motion = np.array([r["visual_motion"] for r in rows], dtype=np.float32)
    audio = np.array([r["audio_rms"] for r in rows], dtype=np.float32)

    motion_score = robust_norm(motion)
    audio_score = robust_norm(audio)
    raw_score = motion_score * 0.75 + audio_score * 0.25
    valleys = candidate_quiet_valleys(raw_score)

    active_120s = rolling_mean(raw_score, 120)

    if expected_games:
        selected_valleys, terminal_end = choose_expected_game_valleys(valleys, len(rows), expected_games)
        selected_valleys = sorted(selected_valleys, key=lambda v: v["start_time"])
        games = []
        cursor = 0
        for valley in selected_valleys:
            games.append((cursor, valley["start_time"]))
            cursor = valley["end_time"]
        games.append((cursor, terminal_end))
    else:
        active_threshold = max(0.45, float(np.nanpercentile(active_120s, 55)))
        game_mask = active_120s > active_threshold
        game_candidates = boolean_segments(game_mask, min_len=8 * 60, pad=45, max_gap=90)

        quiet_threshold = float(np.nanpercentile(active_120s, 35))
        games = []
        for candidate_start, candidate_end in game_candidates:
            games.extend(split_long_segment(candidate_start, candidate_end, active_120s, quiet_threshold))

    # Point-like bursts are shorter active windows inside each game. These are rally
    # candidates, not guaranteed official point boundaries yet.
    result_games = []
    for game_number, (game_start, game_end) in enumerate(games, start=1):
        local_score = rolling_mean(raw_score[game_start:game_end], 3)
        if len(local_score) == 0:
            continue
        burst_threshold = max(0.55, float(np.nanpercentile(local_score, 55)))
        local_mask = local_score > burst_threshold
        bursts = boolean_segments(local_mask, min_len=3, pad=2, max_gap=6)
        points = []
        for point_number, (start, end) in enumerate(bursts, start=1):
            abs_start = game_start + start
            abs_end = game_start + end
            if abs_end - abs_start > 90:
                continue
            points.append(
                {
                    "point_number": point_number,
                    "start_time": round(float(abs_start), 2),
                    "end_time": round(float(abs_end), 2),
                    "start": fmt_time(abs_start),
                    "end": fmt_time(abs_end),
                    "duration": round(float(abs_end - abs_start), 2),
                    "confidence": "low",
                }
            )
        result_games.append(
            {
                "game_number": game_number,
                "start_time": round(float(game_start), 2),
                "end_time": round(float(game_end), 2),
                "start": fmt_time(game_start),
                "end": fmt_time(game_end),
                "duration": round(float(game_end - game_start), 2),
                "point_count": len(points),
                "points": points,
            }
        )

    return {
        "notes": [
            "This is a first-pass segmentation from visual motion and audio loudness only.",
            "Point windows are rally/activity candidates and should be reviewed against the video.",
        ],
        "transition_candidates": valleys,
        "games": result_games,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("timeline", type=pathlib.Path)
    parser.add_argument("--out", type=pathlib.Path, default=pathlib.Path("analysis/segments.json"))
    parser.add_argument("--expected-games", type=int)
    args = parser.parse_args()

    rows = read_timeline(args.timeline)
    output = infer_segments(rows, expected_games=args.expected_games)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(output, indent=2))
    print(f"Wrote {args.out}")
    for game in output["games"]:
        print(
            f"Game {game['game_number']}: {game['start']} - {game['end']} "
            f"({game['duration'] / 60:.1f} min), {game['point_count']} point candidates"
        )


if __name__ == "__main__":
    main()
