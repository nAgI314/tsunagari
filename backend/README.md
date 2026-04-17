# backend

Express + TypeORM + PostgreSQL 構成の API サーバです。

## Setup

```bash
bun install
cp .env.example .env
```

`.env` の DB 設定を更新してください。
`/api/dev/*` を使う場合は `NODE_ENV=development` かつ `DEV_API_ENABLED=true` が必要です。

## DB Migration

```bash
bun run db:migration:run
```

新規 migration 作成:

```bash
bun run db:migration:generate -- CreateUserTable
```

`db:migration:generate` は生成後に import を `type` 付きへ自動補正します（`verbatimModuleSyntax: true` 対応）。
`CreateUserTable` の部分が migration 名です。

直前 migration 差し戻し:

```bash
bun run db:migration:revert
```

依存更新後は `bun install` を再実行してから migration コマンドを使ってください。

## Start server

```bash
bun run start
```

`NODE_ENV=development` の場合、起動時に migration を自動実行します（`relation "user" does not exist` の回避）。

## Run tests

```bash
bun run test
```

## TypeORM の使い方（このプロジェクト）

1. `src/entities` に Entity を追加する
2. `src/data-source.ts` の `entities` に登録する（`migrations` は自動検出）
3. migration を生成・実行する
4. API 側で `AppDataSource.getRepository(Entity)` から CRUD する

`index.ts` では `/api/dev/users` 系で TypeORM Repository の CRUD 利用例を実装しています。

## Endpoints

- `GET /health` - ヘルスチェック
- `POST /api/events` - 日程調整イベント作成（メモリ上で生成）
- `GET /api/dev/users` - User 一覧（TypeORM）
- `POST /api/dev/users` - User 作成（TypeORM）
- `GET /api/dev/users/:id` - User 取得（TypeORM）
- `PATCH /api/dev/users/:id` - User 更新（TypeORM）
- `DELETE /api/dev/users/:id` - User 削除（TypeORM）

`/api/dev/*` は `NODE_ENV=development` かつ `DEV_API_ENABLED=true` のときだけ有効です。
