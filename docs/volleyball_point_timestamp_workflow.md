# Volleyball Point Timestamp Workflow

This workflow stores reviewed volleyball point timestamps from a YouTube game window and produces durable CSV, Markdown, and JSON outputs.

## Inputs

- YouTube video URL.
- Game start and end timestamps in the source video.
- Reviewed point starts, as offsets inside the game window or source timestamps.
- Optionally, reviewed rally-end timestamps and manual review status.

Detection can come from manual review, frame sheets, or a future serve detector. The storage and validation contract stays the same. A point should only be split when a new serve routine/contact is visible inside the previous bucket; motion slowdowns alone are treated as end candidates, not final split evidence.

## Output Contract

The start-only workflow writes:

- `point_id`
- `window_offset`
- `source_timestamp`
- `duration_to_next_start_or_window_end_seconds`
- `validation_flags`
- `notes`

Durations are start-to-next-start, not pure rally length. They include the rally, reset time, and the next serve setup.

The reviewed start/end workflow writes:

- `point_id`
- `window_start_offset`
- `source_start_timestamp`
- `source_end_timestamp`
- `rally_duration_seconds`
- `duration_to_next_start_or_window_end_seconds`
- `reset_gap_to_next_start_seconds`
- `confidence`
- `manual_review_status`
- `validation_flags`
- `notes`

In reviewed outputs, `rally_duration_seconds` is the point itself. `duration_to_next_start_or_window_end_seconds` is retained because it helps detect missed serves or unusually long resets.

## Validation Rules

The workflow includes timing validation gates:

- Flag any duration greater than `30s` as `review_long_duration`.
- Count any duration at or below `18s` as a `short_point_candidate`.
- Expect at least `3` short-point candidates, with `4` as a healthy target.
- Expect total point count to be within the configured game range, default `25-53`.

Reviewed start/end outputs add these validation gates:

- Flag rallies over `30s` as `review_long_rally`.
- Count rallies at or below `12s` as `short_point`.
- Preserve manual statuses such as `review_start`, `review_end`, and `review_end_long`.
- Flag cases where the rally is short but the start-to-next-start bucket is long as `check_for_hidden_serve_or_long_reset`.

These checks are designed to catch the two failure modes we saw:

- Long spans can mean the workflow missed one or more serves.
- A lack of short points is suspicious because some points are won quickly off the serve or the first touch.
- End detection can fire on live-play slowdowns, so point-end candidates must be checked against visible dead-ball posture or the next serve.

## Example

```bash
python3 tools/youtube_point_timestamp_workflow.py \
  "https://www.youtube.com/watch?v=tVv6Mq6Wd5k" \
  --game-start 02:42:24 \
  --game-end 02:58:17 \
  --from-csv youtube_tVv6Mq6Wd5k_20260701/point_timestamps_serve_audit_v2.csv \
  --timestamp-column source_timestamp \
  --out-dir youtube_tVv6Mq6Wd5k_20260701/workflow_output
```

Use `--skip-validation` when you only want to write timestamps without running the audit gates.

Use `--download-video --cut-window` when the workflow should also download the source video and cut the game window into `out-dir/media/game_window.mp4`.

For manually audited start/end rows:

```bash
python3 tools/youtube_point_timestamp_workflow.py \
  "https://www.youtube.com/watch?v=tVv6Mq6Wd5k" \
  --game-start 02:42:24 \
  --game-end 02:58:17 \
  --from-reviewed-csv youtube_tVv6Mq6Wd5k_20260701/point_timestamps_visual_v3_manual_audit.csv \
  --out-dir youtube_tVv6Mq6Wd5k_20260701/workflow_reviewed_output
```

Use `tools/make_point_timeline_sheets.py` to create dense 0.5-second review sheets when validation flags a point:

```bash
python3 tools/make_point_timeline_sheets.py \
  --points-csv youtube_tVv6Mq6Wd5k_20260701/point_timestamps_serve_audit_v2.csv \
  --frame-dir youtube_tVv6Mq6Wd5k_20260701/audit_frames_640 \
  --out-dir youtube_tVv6Mq6Wd5k_20260701/manual_review_sheets \
  --sample-seconds 0.5 \
  --min-duration 0
```
