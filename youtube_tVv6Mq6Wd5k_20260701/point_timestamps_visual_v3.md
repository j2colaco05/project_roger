# Point Timestamps Visual V3

Source: `https://www.youtube.com/watch?v=tVv6Mq6Wd5k`
Game window: `02:42:24.0` to `02:58:17.0`

Point count: 29
Short points (<=12s): 6
Long rallies (>30s): 6
Confidence counts: high 9, medium 16, low 4

This version inserts one missed serve inside the old P001 bucket and adds rally-end estimates. Low-confidence rows should be checked against video clips before being treated as final.

| Point | Start | End | Duration | Confidence | Flags | Notes |
|---|---:|---:|---:|---|---|---|
| P001 | 02:42:32.0 | 02:42:41.5 | 9.5s | high | short_point | original start; quick point ends before hidden serve |
| P002 | 02:42:46.0 | 02:42:53.0 | 7.0s | medium | short_point | inserted missed serve inside old P001; end estimated from reset/next serve setup |
| P003 | 02:43:01.5 | 02:43:29.5 | 28.0s | high |  | old P002; existing serve start kept |
| P004 | 02:43:31.0 | 02:43:50.0 | 19.0s | high |  | old P003; late candidate selected after early false positives |
| P005 | 02:44:02.0 | 02:44:59.5 | 57.5s | medium | long_rally | old P004; long rally, no hidden serve confirmed on timeline sheet |
| P006 | 02:45:04.5 | 02:45:26.5 | 22.0s | high |  | old P005; rally end estimated from reset before next serve |
| P007 | 02:45:33.5 | 02:46:10.0 | 36.5s | medium | long_rally | old P006; 0.5s sheet shows one rally, not multiple serves |
| P008 | 02:46:25.0 | 02:47:11.5 | 46.5s | medium | long_rally | old P007; long rally, later candidate selected |
| P009 | 02:47:20.0 | 02:47:29.0 | 9.0s | low | review_low_confidence;short_point | old P008; no motion candidate, short visual estimate |
| P010 | 02:47:32.0 | 02:47:56.5 | 24.5s | medium |  | old P009; later candidate selected after early false positives |
| P011 | 02:48:11.0 | 02:48:34.0 | 23.0s | medium |  | old P010; late candidate selected |
| P012 | 02:48:43.5 | 02:48:52.0 | 8.5s | high | short_point | old P011; quick point candidate |
| P013 | 02:48:57.0 | 02:49:16.5 | 19.5s | medium |  | old P012; one point plus long reset, no hidden serve confirmed |
| P014 | 02:49:48.5 | 02:50:05.0 | 16.5s | high |  | old P013; later candidate selected |
| P015 | 02:50:10.0 | 02:50:42.0 | 32.0s | low | review_low_confidence;long_rally | old P014; continuous play close to next serve, needs clip review |
| P016 | 02:50:43.5 | 02:51:06.5 | 23.0s | medium |  | old P015; rally end estimated before next serve setup |
| P017 | 02:51:12.0 | 02:51:25.5 | 13.5s | high |  | old P016; late candidate selected |
| P018 | 02:51:30.5 | 02:51:56.5 | 26.0s | medium |  | old P017; later candidate selected |
| P019 | 02:52:01.5 | 02:52:56.0 | 54.5s | low | review_low_confidence;long_rally | old P018; long live rally, no hidden serve confirmed; end near next start |
| P020 | 02:52:59.0 | 02:53:26.5 | 27.5s | medium |  | old P019; later candidate selected |
| P021 | 02:53:34.5 | 02:53:46.0 | 11.5s | high | short_point | old P020; quick point |
| P022 | 02:53:51.0 | 02:54:00.0 | 9.0s | high | short_point | old P021; quick point |
| P023 | 02:54:08.5 | 02:54:21.5 | 13.0s | medium |  | old P022; later candidate selected |
| P024 | 02:54:31.5 | 02:55:00.5 | 29.0s | medium |  | old P023; later candidate selected |
| P025 | 02:55:10.0 | 02:55:31.0 | 21.0s | low | review_low_confidence | old P024; visual estimate after late rally action |
| P026 | 02:55:34.0 | 02:55:56.0 | 22.0s | medium |  | old P025; later candidate selected |
| P027 | 02:56:03.5 | 02:56:26.5 | 23.0s | medium |  | old P026; later candidate selected |
| P028 | 02:56:34.0 | 02:56:51.5 | 17.5s | medium |  | old P027; later candidate selected |
| P029 | 02:57:00.5 | 02:57:38.5 | 38.0s | medium | long_rally | old P028; final rally end before post-game wrap-up |

## Review Assets

- Dense timeline sheets: `serve_boundary_timeline_sheets/` and `serve_boundary_timeline_sheets_0p5s/`
- Point-end candidate sheets: `point_end_detection_all/`
