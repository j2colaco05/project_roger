# Point End Detection Summary

Source window: YouTube `tVv6Mq6Wd5k`, game segment `02:42:24` to `02:58:17`.

This pass scans all currently audited point ranges and flags likely dead-ball / point-end moments from frame motion changes. These are candidates, not official timestamp edits yet. The review sheets are meant to be watched/checked before replacing point ranges.

## Output

- Review folder: `/Users/joashcolaco/Documents/project_roger/youtube_tVv6Mq6Wd5k_20260701/point_end_detection_all`
- Raw JSON: `/Users/joashcolaco/Documents/project_roger/youtube_tVv6Mq6Wd5k_20260701/point_end_detection_all/point_end_candidates_top5.json`
- Review sheets: `P###_*_point_end_candidates.jpg`

## Overall Result

- Points processed: 28
- Points with at least one end candidate: 27
- Points with no end candidate: P008
- Current ranges over 30 seconds: 14
- Current ranges over 30 seconds with an early candidate at 18s or less: 12

## Triage

High priority split checks are the ranges most likely to contain a short point followed by reset time or another point. Long range checks need visual confirmation because the motion-only heuristic can also fire during slow live rallies.

| Point | Current start | Current range | First likely candidate | Candidate duration | Status | Review sheet |
|---|---:|---:|---:|---:|---|---|
| P001 | 02:42:32.0 | 29.5s | 02:42:41.5 | 9.5s | short/normal candidate | P001_29.5s_point_end_candidates.jpg |
| P002 | 02:43:01.5 | 29.5s | 02:43:05.5 | 4.0s | short/normal candidate | P002_29.5s_point_end_candidates.jpg |
| P003 | 02:43:31.0 | 31.0s | 02:43:39.5 | 8.5s | high priority split check | P003_31.0s_point_end_candidates.jpg |
| P004 | 02:44:02.0 | 62.5s | 02:44:23.0 | 21.0s | long range check | P004_62.5s_point_end_candidates.jpg |
| P005 | 02:45:04.5 | 29.0s | 02:45:11.0 | 6.5s | short/normal candidate | P005_29.0s_point_end_candidates.jpg |
| P006 | 02:45:33.5 | 51.5s | 02:45:41.5 | 8.0s | high priority split check | P006_51.5s_point_end_candidates.jpg |
| P007 | 02:46:25.0 | 55.0s | 02:46:32.5 | 7.5s | high priority split check | P007_55.0s_point_end_candidates.jpg |
| P008 | 02:47:20.0 | 12.0s |  |  | no candidate | P008_12.0s_point_end_candidates.jpg |
| P009 | 02:47:32.0 | 39.0s | 02:47:36.0 | 4.0s | high priority split check | P009_39.0s_point_end_candidates.jpg |
| P010 | 02:48:11.0 | 32.5s | 02:48:18.0 | 7.0s | high priority split check | P010_32.5s_point_end_candidates.jpg |
| P011 | 02:48:43.5 | 13.5s | 02:48:52.0 | 8.5s | short/normal candidate | P011_13.5s_point_end_candidates.jpg |
| P012 | 02:48:57.0 | 51.5s | 02:49:01.5 | 4.5s | high priority split check | P012_51.5s_point_end_candidates.jpg |
| P013 | 02:49:48.5 | 21.5s | 02:49:56.0 | 7.5s | short/normal candidate | P013_21.5s_point_end_candidates.jpg |
| P014 | 02:50:10.0 | 33.5s | 02:50:14.0 | 4.0s | high priority split check | P014_33.5s_point_end_candidates.jpg |
| P015 | 02:50:43.5 | 28.5s | 02:50:47.5 | 4.0s | short/normal candidate | P015_28.5s_point_end_candidates.jpg |
| P016 | 02:51:12.0 | 18.5s | 02:51:20.0 | 8.0s | short/normal candidate | P016_18.5s_point_end_candidates.jpg |
| P017 | 02:51:30.5 | 31.0s | 02:51:37.5 | 7.0s | high priority split check | P017_31.0s_point_end_candidates.jpg |
| P018 | 02:52:01.5 | 57.5s | 02:52:10.0 | 8.5s | high priority split check | P018_57.5s_point_end_candidates.jpg |
| P019 | 02:52:59.0 | 35.5s | 02:53:04.0 | 5.0s | high priority split check | P019_35.5s_point_end_candidates.jpg |
| P020 | 02:53:34.5 | 16.5s | 02:53:42.0 | 7.5s | short/normal candidate | P020_16.5s_point_end_candidates.jpg |
| P021 | 02:53:51.0 | 17.5s | 02:53:55.0 | 4.0s | short/normal candidate | P021_17.5s_point_end_candidates.jpg |
| P022 | 02:54:08.5 | 23.0s | 02:54:12.5 | 4.0s | short/normal candidate | P022_23.0s_point_end_candidates.jpg |
| P023 | 02:54:31.5 | 38.5s | 02:54:39.5 | 8.0s | high priority split check | P023_38.5s_point_end_candidates.jpg |
| P024 | 02:55:10.0 | 24.0s | 02:55:21.0 | 11.0s | short/normal candidate | P024_24.0s_point_end_candidates.jpg |
| P025 | 02:55:34.0 | 29.5s | 02:55:42.0 | 8.0s | short/normal candidate | P025_29.5s_point_end_candidates.jpg |
| P026 | 02:56:03.5 | 30.5s | 02:56:09.5 | 6.0s | high priority split check | P026_30.5s_point_end_candidates.jpg |
| P027 | 02:56:34.0 | 26.5s | 02:56:38.0 | 4.0s | short/normal candidate | P027_26.5s_point_end_candidates.jpg |
| P028 | 02:57:00.5 | 76.5s | 02:57:38.5 | 38.0s | long but later candidate only | P028_76.5s_point_end_candidates.jpg |

## Notes From Manual Top-5 Review

- P006 and P018 look like likely quick points ending around 8 to 9 seconds, so they should be verified with the next serve boundary.
- P004, P007, and P028 had early/mid candidates, but the later candidates looked more plausible during the first manual review pass.
- P008 has no motion-based end candidate; it should be checked visually, but it is already short at 12 seconds.

## Next Workflow Change

The official workflow should combine serve-start detection with this end-candidate pass: start at a verified serve, detect the likely dead ball, then compare against the next verified serve. If a range exceeds 30 seconds or contains an early dead-ball candidate under 18 seconds, flag it for human review instead of treating the whole range as one point.
