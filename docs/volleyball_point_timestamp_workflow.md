# Volleyball Point Timestamp Workflow

This workflow stores reviewed volleyball point starts from a YouTube game window and produces durable CSV, Markdown, and JSON outputs.

## Inputs

- YouTube video URL.
- Game start and end timestamps in the source video.
- Reviewed point starts, as offsets inside the game window or source timestamps.

Detection can come from manual review, frame sheets, or a future serve detector. The storage and validation contract stays the same.

## Output Contract

Each point row contains:

- `point_id`
- `window_offset`
- `source_timestamp`
- `duration_to_next_start_or_window_end_seconds`
- `validation_flags`
- `notes`

Durations are start-to-next-start, not pure rally length. They include the rally, reset time, and the next serve setup.

## Validation Rules

The workflow includes timing validation gates:

- Flag any duration greater than `30s` as `review_long_duration`.
- Count any duration at or below `18s` as a `short_point_candidate`.
- Expect at least `3` short-point candidates, with `4` as a healthy target.
- Expect total point count to be within the configured game range, default `25-53`.

These checks are designed to catch the two failure modes we saw:

- Long spans can mean the workflow missed one or more serves.
- A lack of short points is suspicious because some points are won quickly off the serve or the first touch.

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
