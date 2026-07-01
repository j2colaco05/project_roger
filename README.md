# project_roger

project_roger is a volleyball video breakdown tool. Its primary purpose is to turn games into useful point indexes: timestamps, point durations, and lightweight labels such as whether the team won or lost the point. The goal is to make it easy to cut clips, review points, and build better categorization over time.

It can also support light coaching notes, but the center of the repo is the clip breakdown workflow: find the points, store them durably, and keep enough context to review them later.

## Features

- YouTube game-window timestamp workflow
- CSV, Markdown, and JSON point index outputs
- Duration validation rules for suspiciously long points
- Short-point candidate checks for serve-won or quick points
- Existing reviewed point timestamp datasets
- Light team coaching reports and review notes
- Portrait volleyball court with visible net and attack lines
- Six draggable players by default
- Editable player names and roles
- Frame-by-frame movement editing
- Playback animation with speed control
- Player rotation button
- Browser autosave
- Project save/load as JSON
- PNG screenshot export
- WebM video export

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Build

```bash
npm run build
```

## Volleyball Video Workflow

Point timestamps for YouTube game windows can be stored with:

```bash
python3 tools/youtube_point_timestamp_workflow.py \
  "https://www.youtube.com/watch?v=tVv6Mq6Wd5k" \
  --game-start 02:42:24 \
  --game-end 02:58:17 \
  --from-csv youtube_tVv6Mq6Wd5k_20260701/point_timestamps_serve_audit_v2.csv \
  --timestamp-column source_timestamp \
  --out-dir youtube_tVv6Mq6Wd5k_20260701/workflow_output
```

The workflow writes CSV, Markdown, and JSON point data. It can also flag suspicious long point ranges and check that the game includes a healthy number of short serve-won or quick points.

See `docs/volleyball_point_timestamp_workflow.md` for the full output contract and validation rules.
