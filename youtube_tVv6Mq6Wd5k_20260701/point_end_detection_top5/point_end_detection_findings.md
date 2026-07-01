# Point End Detection Findings - Top 5 Longest Ranges

This pass tested point-end detection on the five longest start-to-next-start ranges in `point_timestamps_serve_audit_v2.csv`.

Method:
- Reused cached `0.5s` frames from `audit_frames_640/`.
- Computed frame-to-frame motion.
- Flagged transitions where motion dropped after active play.
- Generated review sheets around each candidate.

Important: these are point-end candidates, not timestamp changes yet. A timestamp should only be split when the next serve start is also confirmed.

## Summary

| Point | Current duration | Best candidate end | Estimated rally duration | Manual read |
|---|---:|---:|---:|---|
| P028 | 76.5s | 02:57:38.5 | 38.0s | Likely point end, then wrap-up. Not a missing short point. |
| P004 | 62.5s | 02:44:59.5 | 57.5s | Likely true long rally/end. Earlier candidates look live. |
| P018 | 57.5s | 02:52:10.0 | 8.5s | Strong quick-point/end candidate. Needs next-serve verification. |
| P007 | 55.0s | 02:47:11.5 | 46.5s | Likely point end before next serve. Earlier candidates look live. |
| P006 | 51.5s | 02:45:41.5 | 8.0s | Strong quick-point/end candidate. Needs next-serve verification. |

## Candidate Sheets

- `P028_76.5s_point_end_candidates.jpg`
- `P004_62.5s_point_end_candidates.jpg`
- `P018_57.5s_point_end_candidates.jpg`
- `P007_55.0s_point_end_candidates.jpg`
- `P006_51.5s_point_end_candidates.jpg`

## What This Reveals

The leak is probably real. The detector found likely short point endings inside long start-to-next-start ranges, especially:

- P006: serve at `02:45:33.5`, likely dead ball around `02:45:41.5`.
- P018: serve at `02:52:01.5`, likely dead ball around `02:52:10.0`.

Those are exactly the shape we expected: quick point, long reset or missed next serve boundary.

## Next Step

For P006 and P018, run a tighter verification pass:

1. Inspect `0.25s` frames from the candidate end through the next known start.
2. Find the next confirmed serve start after the dead ball.
3. If a serve exists, split the range.
4. If no serve exists, keep the timestamp but flag the point as a short-rally/long-reset case.

Recommended priority:

1. P018, because it has multiple suspicious candidate transitions after the quick end.
2. P006, because it strongly resembles a serve-won or immediate-error point.
3. P028, only to mark end-of-game wrap-up, not to find more points.
