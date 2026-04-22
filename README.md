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

## Docker（本番向け / ドメイン公開）

frontend + backend + PostgreSQL をまとめて起動できます。

### Traefikを入口に使う（自動HTTPS）

1. ルートに `.env` を作成（`APP_DOMAIN` を設定）
2. DNS でドメインの A レコードをサーバIPへ向ける
3. サーバ側で `80/tcp` と `443/tcp` を開ける
4. `docker compose up -d --build`

主要な環境変数（未指定時はデフォルトあり）:

- `APP_DOMAIN`（Traefikのルーティングに使用。例: `example.com`）
- `ACME_EMAIL`（Let's Encrypt 通知先）
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `VITE_PUBLIC_APP_ORIGIN`
- `VITE_GOOGLE_CLIENT_ID`

公開ポート:

- `https://<APP_DOMAIN>`（Traefik入口）

Traefik がエッジで HTTPS を終端し、`/api/*` は backend、それ以外は frontend にルーティングします。

`.env` の例:

```env
APP_DOMAIN=example.com
VITE_PUBLIC_APP_ORIGIN=https://example.com
VITE_GOOGLE_CLIENT_ID=1234567890-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
ACME_EMAIL=admin@example.com
DB_USERNAME=foo
DB_PASSWORD=bar
DB_NAME=test_db
```
