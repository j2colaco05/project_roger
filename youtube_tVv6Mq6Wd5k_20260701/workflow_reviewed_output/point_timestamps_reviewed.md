# Reviewed Volleyball Point Timestamps

Source: `https://www.youtube.com/watch?v=tVv6Mq6Wd5k`
Game window: `02:42:24` to `02:58:17`
Point count: 29
Validation status: `needs_review`

Rows include serve-start timestamps and rally-end timestamps. The start-to-next-start duration is retained because it is useful for finding hidden serves or long resets.

| Point | Start | End | Rally duration | Start-to-next-start | Reset gap | Status | Flags |
|---|---:|---:|---:|---:|---:|---|---|
| P001 | 02:42:32.0 | 02:42:41.5 | 9.5s | 14.0s | 4.5s | confirmed | short_point |
| P002 | 02:42:46.0 | 02:42:53.0 | 7.0s | 15.5s | 8.5s | confirmed | short_point |
| P003 | 02:43:01.5 | 02:43:29.5 | 28.0s | 29.5s | 1.5s | confirmed |  |
| P004 | 02:43:31.0 | 02:43:50.0 | 19.0s | 31.0s | 12.0s | confirmed |  |
| P005 | 02:44:02.0 | 02:44:59.5 | 57.5s | 62.5s | 5.0s | confirmed_long | review_long_rally |
| P006 | 02:45:04.5 | 02:45:26.5 | 22.0s | 29.0s | 7.0s | confirmed |  |
| P007 | 02:45:33.5 | 02:46:10.0 | 36.5s | 51.5s | 15.0s | confirmed_long | review_long_rally |
| P008 | 02:46:25.0 | 02:47:11.5 | 46.5s | 55.0s | 8.5s | confirmed_long | review_long_rally |
| P009 | 02:47:20.0 | 02:47:29.0 | 9.0s | 12.0s | 3.0s | review_start | short_point;review_start |
| P010 | 02:47:32.0 | 02:47:56.5 | 24.5s | 39.0s | 14.5s | confirmed |  |
| P011 | 02:48:11.0 | 02:48:34.0 | 23.0s | 32.5s | 9.5s | confirmed |  |
| P012 | 02:48:43.5 | 02:48:52.0 | 8.5s | 13.5s | 5.0s | confirmed_short | short_point |
| P013 | 02:48:57.0 | 02:49:16.5 | 19.5s | 51.5s | 32.0s | confirmed |  |
| P014 | 02:49:48.5 | 02:50:05.0 | 16.5s | 21.5s | 5.0s | confirmed |  |
| P015 | 02:50:10.0 | 02:50:42.0 | 32.0s | 33.5s | 1.5s | review_end | review_long_rally;review_end |
| P016 | 02:50:43.5 | 02:51:06.5 | 23.0s | 28.5s | 5.5s | confirmed |  |
| P017 | 02:51:12.0 | 02:51:25.5 | 13.5s | 18.5s | 5.0s | confirmed |  |
| P018 | 02:51:30.5 | 02:51:56.5 | 26.0s | 31.0s | 5.0s | confirmed |  |
| P019 | 02:52:01.5 | 02:52:56.0 | 54.5s | 57.5s | 3.0s | review_end_long | review_long_rally;review_end_long |
| P020 | 02:52:59.0 | 02:53:26.5 | 27.5s | 35.5s | 8.0s | confirmed |  |
| P021 | 02:53:34.5 | 02:53:46.0 | 11.5s | 16.5s | 5.0s | confirmed_short | short_point |
| P022 | 02:53:51.0 | 02:54:00.0 | 9.0s | 17.5s | 8.5s | confirmed_short | short_point |
| P023 | 02:54:08.5 | 02:54:21.5 | 13.0s | 23.0s | 10.0s | confirmed |  |
| P024 | 02:54:31.5 | 02:55:00.5 | 29.0s | 38.5s | 9.5s | confirmed |  |
| P025 | 02:55:10.0 | 02:55:31.0 | 21.0s | 24.0s | 3.0s | review_end | review_end |
| P026 | 02:55:34.0 | 02:55:56.0 | 22.0s | 29.5s | 7.5s | confirmed |  |
| P027 | 02:56:03.5 | 02:56:26.5 | 23.0s | 30.5s | 7.5s | confirmed |  |
| P028 | 02:56:34.0 | 02:56:51.5 | 17.5s | 26.5s | 9.0s | confirmed |  |
| P029 | 02:57:00.5 | 02:57:38.5 | 38.0s | 76.5s | 38.5s | confirmed_long | review_long_rally |

## Validation Rules

- Flag rallies over 30s as `review_long_rally`.
- Count rallies at or under 12s as `short_point`.
- Preserve manual `review_*` statuses as validation flags.
- Flag short rallies inside long start-to-next-start buckets as possible hidden serve or long reset checks.
- Expect at least 3 short points; target 4.
- Expect 25-53 total points for this game window.

## Validation Summary

- Long rally ids: P005, P007, P008, P015, P019, P029
- Short point ids: P001, P002, P009, P012, P021, P022
- Manual review required: P009, P015, P019, P025
- Possible hidden serve or long reset: none
- Issues: manual_review_required:P009,P015,P019,P025
