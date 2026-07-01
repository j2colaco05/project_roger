#!/usr/bin/env python3
"""Create dense timestamp contact sheets for reviewing point boundaries."""

from __future__ import annotations

import argparse
import csv
import math
from pathlib import Path

from PIL import Image, ImageDraw


def parse_offset(value: str) -> float:
    parts = value.strip().split(":")
    if len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    return float(value)


def fmt_source(window_offset: float, game_start_seconds: float) -> str:
    seconds = game_start_seconds + window_offset
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    remainder = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{remainder:04.1f}"


def frame_path(frame_dir: Path, offset: float, fps: float) -> Path:
    index = int(round(offset * fps)) + 1
    return frame_dir / f"frame_{index:05d}.jpg"


def load_points(points_csv: Path) -> list[dict]:
    points = []
    with points_csv.open() as f:
        for row in csv.DictReader(f):
            start = parse_offset(row["window_offset"])
            duration = float(row["duration_to_next_start_or_window_end_seconds"])
            points.append({**row, "start": start, "end": start + duration, "duration": duration})
    return points


def make_sheet(
    *,
    frame_dir: Path,
    out_path: Path,
    point: dict,
    fps: float,
    sample_seconds: float,
    game_start_seconds: float,
    thumb_width: int,
    columns: int,
) -> None:
    offsets = []
    current = point["start"]
    while current <= point["end"] + 0.001:
        offsets.append(round(current, 1))
        current += sample_seconds

    thumbs = []
    thumb_height = round(thumb_width * 9 / 16)
    for offset in offsets:
        path = frame_path(frame_dir, offset, fps)
        if not path.exists():
            continue
        image = Image.open(path).convert("RGB").resize((thumb_width, thumb_height))
        draw = ImageDraw.Draw(image)
        draw.rectangle([0, thumb_height - 24, thumb_width, thumb_height], fill=(0, 0, 0))
        label = f"+{offset:05.1f} {fmt_source(offset, game_start_seconds)}"
        draw.text((5, thumb_height - 19), label, fill=(255, 255, 255))
        thumbs.append(image)

    rows = math.ceil(len(thumbs) / columns) or 1
    header_height = 34
    sheet = Image.new("RGB", (columns * thumb_width, rows * thumb_height + header_height), (245, 245, 245))
    draw = ImageDraw.Draw(sheet)
    title = (
        f"{point['point_id']}: {fmt_source(point['start'], game_start_seconds)}"
        f" to {fmt_source(point['end'], game_start_seconds)}"
        f" ({point['duration']:.1f}s, every {sample_seconds:g}s)"
    )
    draw.text((8, 10), title, fill=(0, 0, 0))
    for idx, thumb in enumerate(thumbs):
        x = (idx % columns) * thumb_width
        y = header_height + (idx // columns) * thumb_height
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
    parser.add_argument("--sample-seconds", type=float, default=1.0)
    parser.add_argument("--min-duration", type=float, default=18.0)
    parser.add_argument("--thumb-width", type=int, default=240)
    parser.add_argument("--columns", type=int, default=4)
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)
    points = [point for point in load_points(args.points_csv) if point["duration"] >= args.min_duration]
    for point in points:
        out_path = args.out_dir / f"{point['point_id']}_{point['duration']:.1f}s_timeline.jpg"
        make_sheet(
            frame_dir=args.frame_dir,
            out_path=out_path,
            point=point,
            fps=args.fps,
            sample_seconds=args.sample_seconds,
            game_start_seconds=args.game_start_seconds,
            thumb_width=args.thumb_width,
            columns=args.columns,
        )
        print(out_path)


if __name__ == "__main__":
    main()
