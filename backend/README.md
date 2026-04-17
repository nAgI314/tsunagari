# backend

Express + TypeORM + PostgreSQL 構成の API サーバです。

## Setup

```bash
bun install
cp .env.example .env
```

`.env` の DB 設定を更新してください。

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

## Run tests

```bash
bun run test
```

## TypeORM の使い方（このプロジェクト）

1. `src/entities` に Entity を追加する
2. `src/data-source.ts` の `entities` に登録する（`migrations` は自動検出）
3. migration を生成・実行する
4. API 側で `AppDataSource.getRepository(Entity)` から CRUD する

`index.ts` では `POST /api/users` と `GET /api/users/:id` で TypeORM Repository の最小利用例を実装しています。

## Endpoints

- `GET /health` - ヘルスチェック
- `POST /api/events` - 日程調整イベント作成（メモリ上で生成）
- `POST /api/users` - User 作成（TypeORM）
- `GET /api/users/:id` - User 取得（TypeORM）
