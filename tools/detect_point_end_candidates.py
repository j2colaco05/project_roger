#!/usr/bin/env python3
"""Find likely dead-ball / point-end candidates in long volleyball point ranges."""

from __future__ import annotations

import argparse
import csv
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


def parse_offset(value: str) -> float:
    parts = value.strip().split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    return float(value)


def fmt_offset(seconds: float) -> str:
    minutes = int(seconds // 60)
    remainder = seconds % 60
    return f"{minutes:02d}:{remainder:04.1f}"


def fmt_source(window_offset: float, game_start_seconds: float) -> str:
    seconds = game_start_seconds + window_offset
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    remainder = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{remainder:04.1f}"


def frame_path(frame_dir: Path, offset: float, fps: float) -> Path:
    # ffmpeg frame_%05d numbering starts at 1.
    index = int(round(offset * fps)) + 1
    return frame_dir / f"frame_{index:05d}.jpg"


def read_gray(path: Path, width: int = 160) -> np.ndarray:
    image = Image.open(path).convert("L")
    ratio = width / image.width
    image = image.resize((width, max(1, int(image.height * ratio))))
    return np.asarray(image, dtype=np.float32)


def rolling_mean(values: np.ndarray, radius: int) -> np.ndarray:
    if radius <= 0:
        return values.copy()
    out = np.zeros_like(values, dtype=np.float32)
    for i in range(len(values)):
        lo = max(0, i - radius)
        hi = min(len(values), i + radius + 1)
        out[i] = float(np.mean(values[lo:hi]))
    return out


def motion_series(frame_dir: Path, start: float, end: float, fps: float) -> list[dict]:
    rows = []
    previous = None
    for offset in np.arange(start, end + 0.001, 1 / fps):
        path = frame_path(frame_dir, float(offset), fps)
        if not path.exists():
            continue
        gray = read_gray(path)
        motion = 0.0 if previous is None else float(np.mean(np.abs(gray - previous)))
        rows.append({"offset": round(float(offset), 1), "motion": motion, "path": str(path)})
        previous = gray
    return rows


def detect_candidates(rows: list[dict], start: float, end: float, max_candidates: int = 3) -> list[dict]:
    if len(rows) < 12:
        return []

    offsets = np.array([r["offset"] for r in rows], dtype=np.float32)
    motion = np.array([r["motion"] for r in rows], dtype=np.float32)
    smooth = rolling_mean(motion, radius=3)

    candidates = []
    # Search after the first few seconds of serve/play, but avoid the final next-serve setup.
    for i, offset in enumerate(offsets):
        if offset < start + 4 or offset > end - 5:
            continue
        before = smooth[max(0, i - 8) : i]
        after = smooth[i : min(len(smooth), i + 10)]
        if before.size < 4 or after.size < 4:
            continue
        drop = float(np.mean(before) - np.mean(after))
        quiet = float(np.mean(after))
        before_active = float(np.mean(before))
        # Lower quiet score and bigger drop are better. Keep broad candidates;
        # manual review will decide whether this is true dead ball.
        score = drop * 2.0 - quiet * 0.4 + before_active * 0.15
        if drop > 0.15:
            candidates.append(
                {
                    "offset": round(float(offset), 1),
                    "score": round(score, 3),
                    "drop": round(drop, 3),
                    "before_motion": round(before_active, 3),
                    "after_motion": round(quiet, 3),
                }
            )

    candidates = sorted(candidates, key=lambda c: c["score"], reverse=True)
    selected = []
    for candidate in candidates:
        if all(abs(candidate["offset"] - item["offset"]) >= 4 for item in selected):
            selected.append(candidate)
        if len(selected) >= max_candidates:
            break
    return sorted(selected, key=lambda c: c["offset"])


def make_review_sheet(
    frame_dir: Path,
    out_path: Path,
    *,
    point_id: str,
    start: float,
    end: float,
    candidates: list[dict],
    game_start_seconds: float,
    fps: float,
) -> None:
    marks = {round(c["offset"], 1): c for c in candidates}
    sample_offsets = []
    for candidate in candidates:
        for delta in [-3, -2, -1, 0, 1, 2, 3]:
            value = round(candidate["offset"] + delta, 1)
            if start <= value <= end:
                sample_offsets.append(value)
    # Always include serve start and next boundary/end for context.
    sample_offsets.extend([start, min(end, start + 3), max(start, end - 3), end])
    sample_offsets = sorted({round(v, 1) for v in sample_offsets})

    thumbs = []
    for offset in sample_offsets:
        path = frame_path(frame_dir, offset, fps)
        if not path.exists():
            continue
        image = Image.open(path).convert("RGB").resize((320, 180))
        draw = ImageDraw.Draw(image)
        is_candidate = any(abs(offset - c["offset"]) < 0.001 for c in candidates)
        label = f"+{offset:05.1f}  {fmt_source(offset, game_start_seconds)}"
        if is_candidate:
            label += "  END?"
            draw.rectangle([0, 0, 319, 179], outline=(255, 80, 40), width=5)
        draw.rectangle([0, 154, 319, 179], fill=(0, 0, 0))
        draw.text((6, 160), label, fill=(255, 255, 255))
        thumbs.append(image)

    cols = 4
    rows = math.ceil(len(thumbs) / cols) or 1
    sheet = Image.new("RGB", (cols * 320, rows * 180 + 44), (245, 245, 245))
    draw = ImageDraw.Draw(sheet)
    title = f"{point_id}: {fmt_source(start, game_start_seconds)} to {fmt_source(end, game_start_seconds)}"
    draw.text((8, 12), title, fill=(0, 0, 0))
    for idx, thumb in enumerate(thumbs):
        x = (idx % cols) * 320
        y = 44 + (idx // cols) * 180
        sheet.paste(thumb, (x, y))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, quality=90)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--points-csv", type=Path, required=True)
    parser.add_argument("--frame-dir", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--game-start-seconds", type=float, default=2 * 3600 + 42 * 60 + 24)
    parser.add_argument("--fps", type=float, default=2.0)
    parser.add_argument("--top", type=int, default=5)
    args = parser.parse_args()

    points = []
    with args.points_csv.open() as f:
        for row in csv.DictReader(f):
            start = parse_offset(row["window_offset"])
            duration = float(row["duration_to_next_start_or_window_end_seconds"])
            points.append({**row, "start": start, "end": start + duration, "duration": duration})

    longest = sorted(points, key=lambda p: p["duration"], reverse=True)[: args.top]
    results = []
    args.out_dir.mkdir(parents=True, exist_ok=True)
    for point in longest:
        rows = motion_series(args.frame_dir, point["start"], point["end"], args.fps)
        candidates = detect_candidates(rows, point["start"], point["end"])
        sheet_name = f"{point['point_id']}_{point['duration']:.1f}s_point_end_candidates.jpg"
        make_review_sheet(
            args.frame_dir,
            args.out_dir / sheet_name,
            point_id=point["point_id"],
            start=point["start"],
            end=point["end"],
            candidates=candidates,
            game_start_seconds=args.game_start_seconds,
            fps=args.fps,
        )
        results.append(
            {
                "point_id": point["point_id"],
                "start_window_offset": fmt_offset(point["start"]),
                "start_source_timestamp": fmt_source(point["start"], args.game_start_seconds),
                "duration_seconds": point["duration"],
                "range_end_source_timestamp": fmt_source(point["end"], args.game_start_seconds),
                "candidate_review_sheet": sheet_name,
                "point_end_candidates": [
                    {
                        **candidate,
                        "window_offset": fmt_offset(candidate["offset"]),
                        "source_timestamp": fmt_source(candidate["offset"], args.game_start_seconds),
                        "estimated_rally_duration_seconds": round(candidate["offset"] - point["start"], 1),
                    }
                    for candidate in candidates
                ],
            }
        )

    (args.out_dir / "point_end_candidates_top5.json").write_text(json.dumps(results, indent=2))
    md = [
        "# Point End Candidates - Five Longest Ranges",
        "",
        "This is a heuristic pass over cached 0.5s frames. Candidates mark likely transitions from active play into dead-ball/reset behavior.",
        "",
    ]
    for item in results:
        md.extend(
            [
                f"## {item['point_id']} - {item['duration_seconds']:.1f}s",
                "",
                f"- Start: `{item['start_source_timestamp']}`",
                f"- Range end: `{item['range_end_source_timestamp']}`",
                f"- Review sheet: `{item['candidate_review_sheet']}`",
            ]
        )
        if item["point_end_candidates"]:
            for candidate in item["point_end_candidates"]:
                md.append(
                    f"- Candidate end: `{candidate['source_timestamp']}` "
                    f"({candidate['estimated_rally_duration_seconds']:.1f}s after serve), "
                    f"score `{candidate['score']}`, motion drop `{candidate['drop']}`"
                )
        else:
            md.append("- Candidate end: none found by motion heuristic")
        md.append("")
    (args.out_dir / "point_end_candidates_top5.md").write_text("\n".join(md))
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
