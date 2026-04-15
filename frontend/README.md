# frontend

日程調整リンク作成の最小 UI です。`/api/events` に POST してリンクIDを表示します。

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
