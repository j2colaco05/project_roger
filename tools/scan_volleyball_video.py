#!/usr/bin/env python3
import argparse
import csv
import math
import pathlib
import subprocess
import sys

import imageio_ffmpeg
import numpy as np


def run_ffmpeg_frames(video_path, width, fps):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(video_path),
        "-vf",
        f"fps={fps},scale={width}:-1,format=gray",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "gray",
        "pipe:1",
    ]
    return subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def run_ffmpeg_audio(video_path, sample_rate):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(video_path),
        "-ac",
        "1",
        "-ar",
        str(sample_rate),
        "-f",
        "s16le",
        "pipe:1",
    ]
    return subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def detect_scaled_height(video_path, width, fps):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(video_path),
        "-vf",
        f"fps={fps},scale={width}:-1,format=gray",
        "-frames:v",
        "1",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "gray",
        "pipe:1",
    ]
    data = subprocess.check_output(cmd)
    if len(data) % width:
        raise RuntimeError("Unable to infer scaled frame height")
    return len(data) // width


def audio_rms_by_second(video_path, sample_rate):
    proc = run_ffmpeg_audio(video_path, sample_rate)
    bytes_per_second = sample_rate * 2
    values = []
    while True:
        chunk = proc.stdout.read(bytes_per_second)
        if not chunk:
            break
        samples = np.frombuffer(chunk, dtype=np.int16).astype(np.float32)
        if samples.size == 0:
            break
        rms = float(np.sqrt(np.mean(np.square(samples / 32768.0))))
        values.append(rms)
    stderr = proc.stderr.read().decode("utf-8", errors="replace")
    code = proc.wait()
    if code:
        raise RuntimeError(f"ffmpeg audio extraction failed: {stderr}")
    return values


def visual_metrics_by_second(video_path, width, fps):
    height = detect_scaled_height(video_path, width, fps)
    frame_size = width * height
    proc = run_ffmpeg_frames(video_path, width, fps)
    rows = []
    prev = None
    second = 0
    while True:
        data = proc.stdout.read(frame_size)
        if not data:
            break
        if len(data) < frame_size:
            break
        frame = np.frombuffer(data, dtype=np.uint8).reshape((height, width)).astype(np.float32)
        mean = float(frame.mean())
        contrast = float(frame.std())
        if prev is None:
            motion = 0.0
        else:
            motion = float(np.mean(np.abs(frame - prev)))
        rows.append((second, mean, contrast, motion))
        prev = frame
        second += 1
    stderr = proc.stderr.read().decode("utf-8", errors="replace")
    code = proc.wait()
    if code:
        raise RuntimeError(f"ffmpeg frame extraction failed: {stderr}")
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("video", type=pathlib.Path)
    parser.add_argument("--out", type=pathlib.Path, default=pathlib.Path("analysis/timeline_1fps.csv"))
    parser.add_argument("--width", type=int, default=160)
    parser.add_argument("--fps", type=int, default=1)
    parser.add_argument("--audio-rate", type=int, default=8000)
    args = parser.parse_args()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    print("Extracting visual metrics...", file=sys.stderr)
    visual_rows = visual_metrics_by_second(args.video, args.width, args.fps)
    print("Extracting audio metrics...", file=sys.stderr)
    audio = audio_rms_by_second(args.video, args.audio_rate)

    count = max(len(visual_rows), len(audio))
    with args.out.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["second", "visual_mean", "visual_contrast", "visual_motion", "audio_rms"])
        writer.writeheader()
        for i in range(count):
            if i < len(visual_rows):
                _, mean, contrast, motion = visual_rows[i]
            else:
                mean = contrast = motion = math.nan
            writer.writerow(
                {
                    "second": i,
                    "visual_mean": mean,
                    "visual_contrast": contrast,
                    "visual_motion": motion,
                    "audio_rms": audio[i] if i < len(audio) else math.nan,
                }
            )
    print(f"Wrote {args.out} ({count} seconds)", file=sys.stderr)


if __name__ == "__main__":
    main()
