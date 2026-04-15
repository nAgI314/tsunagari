# backend

最小構成の API サーバです。共有リンク型の日程調整イベント作成を試せます。

## Setup

```bash
bun install
```

## Start server

```bash
bun run start
```

## Run tests

```bash
bun run test
```

## Endpoints

- `GET /health` - ヘルスチェック
- `POST /api/events` - 日程調整イベント作成
