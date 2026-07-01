#!/usr/bin/env python3
"""Store and audit volleyball point timestamps from a YouTube game window.

This module intentionally separates point-start detection from timestamp
storage. The detection step can be manual review, an ML model, or a future
serve detector. Once starts are provided, this workflow writes stable CSV,
Markdown, and JSON outputs and can flag suspicious timing patterns.
"""

from __future__ import annotations

import argparse
import csv
import json
import shutil
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class DurationValidationConfig:
    long_point_seconds: float = 30.0
    short_point_seconds: float = 18.0
    min_short_point_count: int = 3
    target_short_point_count: int = 4
    min_point_count: int = 25
    max_point_count: int = 53


def parse_timecode(value: str | float | int) -> float:
    if isinstance(value, (float, int)):
        return float(value)

    raw = str(value).strip()
    if not raw:
        raise ValueError("Empty timestamp")
    if ":" not in raw:
        return float(raw)

    parts = raw.split(":")
    if len(parts) == 2:
        minutes, seconds = parts
        return int(minutes) * 60 + float(seconds)
    if len(parts) == 3:
        hours, minutes, seconds = parts
        return int(hours) * 3600 + int(minutes) * 60 + float(seconds)
    raise ValueError(f"Unsupported timestamp format: {value}")


def format_time(seconds: float) -> str:
    seconds = round(float(seconds), 1)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    remainder = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{remainder:04.1f}"


def format_offset(seconds: float) -> str:
    seconds = round(float(seconds), 1)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    remainder = seconds % 60
    if hours:
        return f"{hours:02d}:{minutes:02d}:{remainder:04.1f}"
    return f"{minutes:02d}:{remainder:04.1f}"


def read_point_starts_from_csv(path: Path, column: str, game_start_seconds: float) -> list[float]:
    rows = list(csv.DictReader(path.open()))
    if not rows:
        return []

    if column == "auto":
        fields = rows[0].keys()
        if "window_offset" in fields:
            column = "window_offset"
        elif "source_timestamp" in fields:
            column = "source_timestamp"
        elif "start_seconds" in fields:
            column = "start_seconds"
        else:
            raise ValueError("Could not infer timestamp column from CSV")

    starts = []
    for row in rows:
        value = row.get(column, "").strip()
        if not value:
            continue
        seconds = parse_timecode(value)
        if column == "source_timestamp":
            seconds -= game_start_seconds
        starts.append(seconds)
    return starts


def normalize_starts(starts: Iterable[float], game_duration_seconds: float) -> list[float]:
    unique = sorted({round(float(start), 1) for start in starts})
    return [start for start in unique if 0 <= start <= game_duration_seconds]


def build_point_rows(
    point_starts: Iterable[float],
    *,
    game_start_seconds: float,
    game_end_seconds: float,
) -> list[dict]:
    game_duration_seconds = game_end_seconds - game_start_seconds
    starts = normalize_starts(point_starts, game_duration_seconds)
    rows = []
    for index, start in enumerate(starts):
        next_start = starts[index + 1] if index + 1 < len(starts) else game_duration_seconds
        duration = round(next_start - start, 1)
        rows.append(
            {
                "point_id": f"P{index + 1:03d}",
                "window_offset": format_offset(start),
                "source_timestamp": format_time(game_start_seconds + start),
                "duration_to_next_start_or_window_end_seconds": duration,
                "validation_flags": "",
                "notes": "",
            }
        )
    return rows


def validate_point_rows(rows: list[dict], config: DurationValidationConfig) -> dict:
    long_points = []
    short_points = []
    for row in rows:
        duration = float(row["duration_to_next_start_or_window_end_seconds"])
        flags = []
        if duration > config.long_point_seconds:
            flags.append("review_long_duration")
            long_points.append(row["point_id"])
        if duration <= config.short_point_seconds:
            flags.append("short_point_candidate")
            short_points.append(row["point_id"])
        row["validation_flags"] = ";".join(flags)

    issues = []
    point_count = len(rows)
    if point_count < config.min_point_count or point_count > config.max_point_count:
        issues.append(
            f"point_count_out_of_expected_range:{point_count} "
            f"not in {config.min_point_count}-{config.max_point_count}"
        )
    if len(short_points) < config.min_short_point_count:
        issues.append(
            f"too_few_short_points:{len(short_points)} "
            f"expected_at_least_{config.min_short_point_count}"
        )

    return {
        "status": "needs_review" if issues or long_points else "passed",
        "issues": issues,
        "point_count": point_count,
        "long_point_ids": long_points,
        "short_point_candidate_ids": short_points,
        "short_point_count": len(short_points),
        "config": asdict(config),
    }


def write_outputs(
    rows: list[dict],
    *,
    out_dir: Path,
    youtube_url: str,
    game_start: str,
    game_end: str,
    validation_summary: dict | None,
    config: DurationValidationConfig,
) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = out_dir / "point_timestamps.csv"
    md_path = out_dir / "point_timestamps.md"
    json_path = out_dir / "point_timestamps.json"

    csv_fields = [
        "point_id",
        "window_offset",
        "source_timestamp",
        "duration_to_next_start_or_window_end_seconds",
        "validation_flags",
        "notes",
    ]
    with csv_path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=csv_fields)
        writer.writeheader()
        writer.writerows(rows)

    payload = {
        "youtube_url": youtube_url,
        "game_start": game_start,
        "game_end": game_end,
        "point_count": len(rows),
        "validation": validation_summary
        or {
            "status": "configured_not_run",
            "config": asdict(config),
        },
        "points": rows,
    }
    json_path.write_text(json.dumps(payload, indent=2))

    validation_status = payload["validation"]["status"]
    lines = [
        "# Volleyball Point Timestamps",
        "",
        f"Source: `{youtube_url}`",
        f"Game window: `{game_start}` to `{game_end}`",
        f"Point count: {len(rows)}",
        f"Validation status: `{validation_status}`",
        "",
        "Durations are start-to-next-start, not pure rally length.",
        "",
        "| Point | Window offset | Source timestamp | Duration | Flags |",
        "|---|---:|---:|---:|---|",
    ]
    for row in rows:
        lines.append(
            "| {point_id} | {window_offset} | {source_timestamp} | "
            "{duration_to_next_start_or_window_end_seconds}s | {validation_flags} |".format(**row)
        )
    lines.extend(
        [
            "",
            "## Validation Rules",
            "",
            f"- Flag points over {config.long_point_seconds:g}s for review.",
            f"- Count points at or under {config.short_point_seconds:g}s as short-point candidates.",
            f"- Expect at least {config.min_short_point_count} short-point candidates; target {config.target_short_point_count}.",
            f"- Expect {config.min_point_count}-{config.max_point_count} total points for this game window.",
        ]
    )
    if validation_summary:
        lines.extend(
            [
                "",
                "## Validation Summary",
                "",
                f"- Long point ids: {', '.join(validation_summary['long_point_ids']) or 'none'}",
                f"- Short point candidates: {', '.join(validation_summary['short_point_candidate_ids']) or 'none'}",
                f"- Issues: {', '.join(validation_summary['issues']) or 'none'}",
            ]
        )
    md_path.write_text("\n".join(lines) + "\n")

    return {"csv": str(csv_path), "markdown": str(md_path), "json": str(json_path)}


def find_ffmpeg() -> str:
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            raise RuntimeError("ffmpeg is required. Install ffmpeg or imageio-ffmpeg.")
        return ffmpeg


def download_youtube_video(youtube_url: str, out_dir: Path) -> Path:
    yt_dlp = shutil.which("yt-dlp")
    if not yt_dlp:
        raise RuntimeError("yt-dlp is required for downloading YouTube videos.")
    out_dir.mkdir(parents=True, exist_ok=True)
    output_template = str(out_dir / "source.%(ext)s")
    subprocess.run(
        [
            yt_dlp,
            "--force-overwrites",
            "-f",
            "bv*+ba/b",
            "--merge-output-format",
            "mp4",
            "-o",
            output_template,
            youtube_url,
        ],
        check=True,
    )
    return out_dir / "source.mp4"


def cut_game_window(video_path: Path, out_path: Path, game_start: str, game_end: str) -> Path:
    start_seconds = parse_timecode(game_start)
    end_seconds = parse_timecode(game_end)
    duration = end_seconds - start_seconds
    if duration <= 0:
        raise ValueError("Game end must be after game start")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            find_ffmpeg(),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-ss",
            str(start_seconds),
            "-i",
            str(video_path),
            "-t",
            str(duration),
            "-c",
            "copy",
            str(out_path),
        ],
        check=True,
    )
    return out_path


def store_youtube_point_timestamps(
    youtube_url: str,
    *,
    game_start: str,
    game_end: str,
    out_dir: Path,
    point_starts: Iterable[float],
    run_validation: bool = True,
    validation_config: DurationValidationConfig = DurationValidationConfig(),
) -> dict:
    game_start_seconds = parse_timecode(game_start)
    game_end_seconds = parse_timecode(game_end)
    rows = build_point_rows(
        point_starts,
        game_start_seconds=game_start_seconds,
        game_end_seconds=game_end_seconds,
    )
    validation_summary = validate_point_rows(rows, validation_config) if run_validation else None
    return write_outputs(
        rows,
        out_dir=out_dir,
        youtube_url=youtube_url,
        game_start=game_start,
        game_end=game_end,
        validation_summary=validation_summary,
        config=validation_config,
    )


def parse_start_list(raw: str) -> list[float]:
    if not raw:
        return []
    return [parse_timecode(part.strip()) for part in raw.split(",") if part.strip()]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("youtube_url")
    parser.add_argument("--game-start", required=True, help="Absolute video timestamp, preferably HH:MM:SS.s")
    parser.add_argument("--game-end", required=True, help="Absolute video timestamp, preferably HH:MM:SS.s")
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--point-starts", default="", help="Comma-separated window offsets, such as 00:08.0,00:37.5")
    parser.add_argument("--from-csv", type=Path, help="Existing reviewed timestamp CSV")
    parser.add_argument("--timestamp-column", default="auto", help="auto, window_offset, source_timestamp, or start_seconds")
    parser.add_argument("--skip-validation", action="store_true", help="Write outputs without running validation gates")
    parser.add_argument("--download-video", action="store_true", help="Download the YouTube video into out-dir/media")
    parser.add_argument("--cut-window", action="store_true", help="Cut the requested game window after download")
    parser.add_argument("--long-point-seconds", type=float, default=30.0)
    parser.add_argument("--short-point-seconds", type=float, default=18.0)
    parser.add_argument("--min-short-points", type=int, default=3)
    parser.add_argument("--target-short-points", type=int, default=4)
    parser.add_argument("--min-points", type=int, default=25)
    parser.add_argument("--max-points", type=int, default=53)
    args = parser.parse_args()

    starts = parse_start_list(args.point_starts)
    if args.from_csv:
        starts.extend(
            read_point_starts_from_csv(
                args.from_csv,
                args.timestamp_column,
                parse_timecode(args.game_start),
            )
        )
    if not starts:
        raise SystemExit("Provide --point-starts or --from-csv with reviewed serve-start timestamps.")

    if args.download_video:
        source = download_youtube_video(args.youtube_url, args.out_dir / "media")
        if args.cut_window:
            cut_game_window(source, args.out_dir / "media" / "game_window.mp4", args.game_start, args.game_end)

    config = DurationValidationConfig(
        long_point_seconds=args.long_point_seconds,
        short_point_seconds=args.short_point_seconds,
        min_short_point_count=args.min_short_points,
        target_short_point_count=args.target_short_points,
        min_point_count=args.min_points,
        max_point_count=args.max_points,
    )
    outputs = store_youtube_point_timestamps(
        args.youtube_url,
        game_start=args.game_start,
        game_end=args.game_end,
        out_dir=args.out_dir,
        point_starts=starts,
        run_validation=not args.skip_validation,
        validation_config=config,
    )
    print(json.dumps(outputs, indent=2))


if __name__ == "__main__":
    main()
