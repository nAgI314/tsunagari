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

## Docker（本番向け）

frontend + backend + PostgreSQL をまとめて起動できます。

1. ルートに `.env` を作成（任意）
2. `docker compose up -d --build`

主要な環境変数（未指定時はデフォルトあり）:

- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `VITE_PUBLIC_APP_ORIGIN`
- `VITE_GOOGLE_CLIENT_ID`

公開ポート:

- `http://localhost`（frontend, Apache）

Apache が `/api/*` を backend へリバースプロキシします。
