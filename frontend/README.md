# frontend

日程調整リンク作成の最小 UI です。`/api/events` に POST してリンクIDを表示します。

開発環境では `/dev` に DB 操作用ページがあります（User の一覧・追加・更新・削除）。
有効化するには `.env.example` を `.env` にコピーして `VITE_ENABLE_DEV_PAGE=true` を設定してください。
`/dev` は `import.meta.env.DEV` かつ `VITE_ENABLE_DEV_PAGE=true` のときだけ表示されます。

## 開発起動

```bash
bun install
bun run dev
```

別ターミナルで backend も起動してください。

```bash
cd ../backend
bun run start
```

## テスト

```bash
bun run test
```

`src/App.test.tsx` でフロント側の送信動作を検証します。
