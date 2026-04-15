# tsunagari
日程調整リンクを共有して候補日を集めるためのモノレポです。

## backend テスト

```bash
cd backend
bun install
bun run test
```

サーバ起動:

```bash
cd backend
bun run start
```

利用可能なエンドポイント:

- `GET /health`
- `POST /api/events`

## frontend テスト

```bash
cd frontend
bun install
bun run test
```

フロントは `POST /api/events` へ送信する最小フォームと、その送信処理テストを含みます。
