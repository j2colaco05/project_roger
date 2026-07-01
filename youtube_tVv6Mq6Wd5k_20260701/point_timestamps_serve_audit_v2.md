# Serve Audit V2 - Point Timestamps

Source video: `https://www.youtube.com/watch?v=tVv6Mq6Wd5k`

Requested game window: `02:42:24` to `02:58:17`

Local clip: `/Users/joashcolaco/Documents/project_roger/youtube_tVv6Mq6Wd5k_20260701/game_window_02-42-24_to_02-58-17.mp4`

Audit method:
- Reviewed 0.5-second frame sheets.
- Confirmed each listed point starts at or just before a visible serve routine/contact.
- Re-checked every duration greater than 30 seconds.
- Split old long ranges where a new serve was found.
- Removed the first-pass `02:57:31` split because it was mid-rally, not a serve.

Result: 28 points.

Important interpretation: durations below are start-to-next-start, not pure rally length. They include rally time, dead-ball reset, and the next serve setup. The final duration runs to the requested window end and includes post-point/wrap-up.

| Point | Window offset | Source timestamp | Duration to next start/window end | Audit note |
|---|---:|---:|---:|---|
| P001 | 00:08.0 | 02:42:32.0 | 29.5s | Serve visible shortly after window begins |
| P002 | 00:37.5 | 02:43:01.5 | 29.5s | Serve visible |
| P003 | 01:07.0 | 02:43:31.0 | 31.0s | Reviewed long span; no hidden serve |
| P004 | 01:38.0 | 02:44:02.0 | 62.5s | Reviewed long rally plus reset |
| P005 | 02:40.5 | 02:45:04.5 | 29.0s | Serve visible |
| P006 | 03:09.5 | 02:45:33.5 | 51.5s | Reviewed long rally plus reset |
| P007 | 04:01.0 | 02:46:25.0 | 55.0s | Start adjusted earlier to include serve routine |
| P008 | 04:56.0 | 02:47:20.0 | 12.0s | New split found inside old long span |
| P009 | 05:08.0 | 02:47:32.0 | 39.0s | New split found inside old long span |
| P010 | 05:47.0 | 02:48:11.0 | 32.5s | Reviewed long span; no hidden serve |
| P011 | 06:19.5 | 02:48:43.5 | 13.5s | Serve visible |
| P012 | 06:33.0 | 02:48:57.0 | 51.5s | Start adjusted earlier to include serve routine |
| P013 | 07:24.5 | 02:49:48.5 | 21.5s | Serve visible |
| P014 | 07:46.0 | 02:50:10.0 | 33.5s | New split found inside old long span |
| P015 | 08:19.5 | 02:50:43.5 | 28.5s | New split found inside old long span |
| P016 | 08:48.0 | 02:51:12.0 | 18.5s | Serve visible |
| P017 | 09:06.5 | 02:51:30.5 | 31.0s | Reviewed long span; no hidden serve |
| P018 | 09:37.5 | 02:52:01.5 | 57.5s | Reviewed long rally plus reset |
| P019 | 10:35.0 | 02:52:59.0 | 35.5s | Start adjusted earlier to include serve routine |
| P020 | 11:10.5 | 02:53:34.5 | 16.5s | Serve visible |
| P021 | 11:27.0 | 02:53:51.0 | 17.5s | Serve visible |
| P022 | 11:44.5 | 02:54:08.5 | 23.0s | Serve visible; old critical gap split after this |
| P023 | 12:07.5 | 02:54:31.5 | 38.5s | New split found inside old critical gap |
| P024 | 12:46.0 | 02:55:10.0 | 24.0s | New split found inside old critical gap |
| P025 | 13:10.0 | 02:55:34.0 | 29.5s | New split found inside old critical gap |
| P026 | 13:39.5 | 02:56:03.5 | 30.5s | Start moved from reset/huddle to actual serve routine |
| P027 | 14:10.0 | 02:56:34.0 | 26.5s | Start adjusted earlier to include serve setup |
| P028 | 14:36.5 | 02:57:00.5 | 76.5s | Final point; old 02:57:31 split was mid-rally; remainder includes wrap-up |

## Long Range Review

Every range over 30 seconds was reviewed. These were split because a missed serve was found:

- Old P007 range: added `02:47:20.0` and `02:47:32.0`.
- Old P011 range: added `02:50:10.0` and `02:50:43.5`.
- Old P018 critical range: added `02:54:31.5`, `02:55:10.0`, and `02:55:34.0`.

These remained long after review because they were long rallies, reset time, or end-window wrap-up:

- P003: 31.0s
- P004: 62.5s
- P006: 51.5s
- P007: 55.0s
- P009: 39.0s
- P010: 32.5s
- P012: 51.5s
- P014: 33.5s
- P017: 31.0s
- P018: 57.5s
- P019: 35.5s
- P023: 38.5s
- P026: 30.5s
- P028: 76.5s, because it runs to the requested window end and includes post-point/wrap-up
