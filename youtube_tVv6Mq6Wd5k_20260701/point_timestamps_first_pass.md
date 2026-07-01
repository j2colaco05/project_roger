# Mango Season 6 Week 8 Court 1 - Point Timestamp First Pass

YouTube: `https://www.youtube.com/watch?v=tVv6Mq6Wd5k`

Source title: `Mango Season 6 Week 8 - Court 1`

Requested game window: `02:42:24-02:58:17`

Local working folder:

```text
/Users/joashcolaco/Documents/New project/youtube_tVv6Mq6Wd5k_20260701
```

Downloaded full video:

```text
/Users/joashcolaco/Documents/New project/youtube_tVv6Mq6Wd5k_20260701/full_android_tVv6Mq6Wd5k.mp4
```

Cut game-window clip:

```text
/Users/joashcolaco/Documents/New project/youtube_tVv6Mq6Wd5k_20260701/game_window_02-42-24_to_02-58-17.mp4
```

0.5-second scan sheets:

```text
/Users/joashcolaco/Documents/New project/youtube_tVv6Mq6Wd5k_20260701/sheets_0p5s
```

## First-Pass Point Starts

This is a first visual pass from 0.5-second contact sheets. It is useful, but it should not be treated as final until we sample clips together. The most suspicious section is after `P018`, where there is a long gap from `02:54:08.5` to the next low-confidence candidate at `02:56:00.5`.

| Point | Window Offset | Source Timestamp | Confidence | Review Flag | Seconds To Next Start | Notes |
|---|---:|---:|---|---|---:|---|
| P001 | 00:00:08.0 | 02:42:32.0 | medium |  | 29.5 | Near-side serve visible shortly after the requested window begins. |
| P002 | 00:00:37.5 | 02:43:01.5 | medium |  | 29.5 | Serve motion visible from near side. |
| P003 | 00:01:07.0 | 02:43:31.0 | medium |  | 31.0 | Serve motion visible from near side. |
| P004 | 00:01:38.0 | 02:44:02.0 | low | long_gap_after | 62.5 | Serve/reset boundary is less clear; long gap to next detected serve should be reviewed. |
| P005 | 00:02:40.5 | 02:45:04.5 | medium |  | 29.0 | Serve motion visible from left side of frame. |
| P006 | 00:03:09.5 | 02:45:33.5 | low | long_gap_after | 55.0 | Serving action appears near frame edge; review recommended. |
| P007 | 00:04:04.5 | 02:46:28.5 | medium | long_gap_after | 102.5 | Clearer serve motion, followed by a very long rally/reset span. |
| P008 | 00:05:47.0 | 02:48:11.0 | low |  | 32.5 | Serve boundary inferred from reset and ball movement. |
| P009 | 00:06:19.5 | 02:48:43.5 | medium |  | 16.0 | Serve motion visible after a reset. |
| P010 | 00:06:35.5 | 02:48:59.5 | medium | long_gap_after | 49.0 | Near-side serve visible; long gap after this point should be checked. |
| P011 | 00:07:24.5 | 02:49:48.5 | low | long_gap_after | 83.5 | Serve boundary is subtle from the camera angle. |
| P012 | 00:08:48.0 | 02:51:12.0 | high |  | 18.5 | Clear near-side serve toss/contact. |
| P013 | 00:09:06.5 | 02:51:30.5 | medium |  | 31.0 | Serve motion visible from near side. |
| P014 | 00:09:37.5 | 02:52:01.5 | high | long_gap_after | 58.0 | Clear near-side serve toss/contact. |
| P015 | 00:10:35.5 | 02:52:59.5 | medium |  | 35.0 | Foreground/near-side serve action visible. |
| P016 | 00:11:10.5 | 02:53:34.5 | high |  | 16.5 | Clear foreground serve toss/contact. |
| P017 | 00:11:27.0 | 02:53:51.0 | medium |  | 17.5 | Another quick serve after the previous point. |
| P018 | 00:11:44.5 | 02:54:08.5 | high | critical_gap_after | 112.0 | Clear serve; the following 112-second gap is suspicious and likely needs manual clip review. |
| P019 | 00:13:36.5 | 02:56:00.5 | low |  | 34.0 | Candidate serve/start inferred from formation change in the long gap. |
| P020 | 00:14:10.5 | 02:56:34.5 | low |  | 26.0 | Candidate serve/start inferred from reset and player movement. |
| P021 | 00:14:36.5 | 02:57:00.5 | medium |  | 30.5 | Serve action visible near left/back side. |
| P022 | 00:15:07.0 | 02:57:31.0 | high | partial_end_window | 46.0 | Clear near-side serve; point sequence ends before/near requested window end. |

## Review Notes

- This first pass identifies `22` point starts.
- The scan interval was `0.5 seconds`.
- The `02:54:08.5-02:56:00.5` gap is too long for this game rhythm and should be reviewed first.
- Low-confidence starts should be sampled as short clips before finalizing the workflow output.
- Next step: cut point clips from this CSV, then review a random sample and the suspicious long-gap section.
