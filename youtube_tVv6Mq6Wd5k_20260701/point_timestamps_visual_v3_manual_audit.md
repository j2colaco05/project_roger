# Manual Audit - Point Timestamps Visual V3

Source: `https://www.youtube.com/watch?v=tVv6Mq6Wd5k`
Game window: `02:42:24.0` to `02:58:17.0`

All 29 v3 point sheets were manually checked at 0.5-second sampling.

Point count after manual audit: 29
Confirmed/usable points: 25
Needs clip-level review: 4 (`P009`, `P015`, `P019`, `P025`)

No additional hidden serves were confirmed during this full manual pass. The point count stays at 29.

## Key Learning

- The earlier point-end detector often fired on live-play slowdowns, especially when players briefly reset their feet during a rally.
- Long duration alone is not enough to split a point; several 30-55s ranges were real continuous rallies.
- The more reliable split signal is a new serve routine/contact inside an existing bucket. That was clearly found in old P001 and became P002 in v3.
- Start timestamps currently represent serve routine / serve-visible start, not exact contact time. Exact contact should become a separate optional field later.
- Rally-end detection should propose candidates, but official point boundaries should require either a next serve or a clear dead-ball posture after the rally.

## Manual Status Table

| Point | Start | End | Duration | Manual status | Notes |
|---|---:|---:|---:|---|---|
| P001 | 02:42:32.0 | 02:42:41.5 | 9.5s | confirmed | Serve/rally/end visible; old bucket correctly split before P002. |
| P002 | 02:42:46.0 | 02:42:53.0 | 7.0s | confirmed | Inserted missed quick point looks valid; starts with serve sequence and ends before P003 setup. |
| P003 | 02:43:01.5 | 02:43:29.5 | 28.0s | confirmed | Starts with serve; one continuous point, no hidden serve. |
| P004 | 02:43:31.0 | 02:43:50.0 | 19.0s | confirmed | Starts with serve; later end is correct, early motion drops were false positives during live play. |
| P005 | 02:44:02.0 | 02:44:59.5 | 57.5s | confirmed_long | True long rally; no hidden serve seen in 0.5s sheet. |
| P006 | 02:45:04.5 | 02:45:26.5 | 22.0s | confirmed | Starts with serve; one point, no hidden serve. |
| P007 | 02:45:33.5 | 02:46:10.0 | 36.5s | confirmed_long | Long setup/rally but continuous; no hidden serve. |
| P008 | 02:46:25.0 | 02:47:11.5 | 46.5s | confirmed_long | True long rally, no hidden serve; end selected from later dead-ball posture. |
| P009 | 02:47:20.0 | 02:47:29.0 | 9.0s | review_start | Short point remains low confidence; start frame is not a clean serve-contact view, but range fits a quick point before P010. |
| P010 | 02:47:32.0 | 02:47:56.5 | 24.5s | confirmed | Starts with serve; one continuous point. |
| P011 | 02:48:11.0 | 02:48:34.0 | 23.0s | confirmed | Starts with serve routine; one continuous point. |
| P012 | 02:48:43.5 | 02:48:52.0 | 8.5s | confirmed_short | Quick point; serve and reset are visible enough. |
| P013 | 02:48:57.0 | 02:49:16.5 | 19.5s | confirmed | Starts with serve; no hidden serve. |
| P014 | 02:49:48.5 | 02:50:05.0 | 16.5s | confirmed | Starts with serve; one continuous point. |
| P015 | 02:50:10.0 | 02:50:42.0 | 32.0s | review_end | Continuous point, but end boundary is visually tight near next setup; keep review flag. |
| P016 | 02:50:43.5 | 02:51:06.5 | 23.0s | confirmed | Starts with serve; rally/end look consistent. |
| P017 | 02:51:12.0 | 02:51:25.5 | 13.5s | confirmed | Short/normal point; serve and end look consistent. |
| P018 | 02:51:30.5 | 02:51:56.5 | 26.0s | confirmed | Starts with serve; one continuous point. |
| P019 | 02:52:01.5 | 02:52:56.0 | 54.5s | review_end_long | True long rally; no hidden serve seen, but rally end is close to next start and should be clip-reviewed. |
| P020 | 02:52:59.0 | 02:53:26.5 | 27.5s | confirmed | Starts with serve; one continuous point. |
| P021 | 02:53:34.5 | 02:53:46.0 | 11.5s | confirmed_short | Quick point; serve and end visible. |
| P022 | 02:53:51.0 | 02:54:00.0 | 9.0s | confirmed_short | Quick point; serve and end visible. |
| P023 | 02:54:08.5 | 02:54:21.5 | 13.0s | confirmed | Starts with serve; one continuous point. |
| P024 | 02:54:31.5 | 02:55:00.5 | 29.0s | confirmed | Starts with serve; one continuous point, no hidden serve. |
| P025 | 02:55:10.0 | 02:55:31.0 | 21.0s | review_end | Starts with serve; no hidden serve, but end boundary should be clip-reviewed. |
| P026 | 02:55:34.0 | 02:55:56.0 | 22.0s | confirmed | Starts with serve; one continuous point. |
| P027 | 02:56:03.5 | 02:56:26.5 | 23.0s | confirmed | Starts with serve; one continuous point. |
| P028 | 02:56:34.0 | 02:56:51.5 | 17.5s | confirmed | Starts with serve; one continuous point. |
| P029 | 02:57:00.5 | 02:57:38.5 | 38.0s | confirmed_long | Final long rally; end before post-game/wrap-up looks plausible. |

## Review Assets

- All-point 0.5s sheets: `/Users/joashcolaco/Documents/project_roger/youtube_tVv6Mq6Wd5k_20260701/manual_v3_all_points_0p5s`
- Audited CSV: `/Users/joashcolaco/Documents/project_roger/youtube_tVv6Mq6Wd5k_20260701/point_timestamps_visual_v3_manual_audit.csv`
