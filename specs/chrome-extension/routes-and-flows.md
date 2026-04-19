# ルートとフロー

この拡張機能は Web サイトのページ遷移を持たず、`browser_extension/entrypoints/popup/` のポップアップ単位で完結する。

## フロー

### 初期化

1. ポップアップを開く
2. 現在アクティブなタブのタイトルと URL を取得する
3. API サーバー URL を読み込む
4. `/health` を呼び出して接続状態を表示する
5. 接続成功時は `/bookmarks/by-url?url=...` で既存ブックマークを確認する
6. 既存ブックマークがある場合は、その値をフォームの初期値として反映する
7. `/folders` と `/tags` を取得して選択 UI を初期化する

### 保存

1. 現在タブのタイトル、URL、説明、フォルダ、タグを入力する
2. 保存ボタンを押す
3. `/bookmarks/by-url?url=...` に PATCH を送る
4. `404` の場合は `/bookmarks` に POST して新規作成する
5. 成功した場合は完了メッセージを表示する

### 削除

1. 削除ボタンを押す
2. `/bookmarks?url=...` に DELETE を送る
3. 成功した場合は完了メッセージを表示する

### 補助操作

1. リロードボタンで `/health` を再実行する
2. Close ボタンでポップアップを閉じる

## API 依存

- `GET /health`
- `GET /folders`
- `GET /tags`
- `GET /bookmarks/by-url?url=...`
- `POST /bookmarks`
- `PATCH /bookmarks/by-url?url=...`
- `DELETE /bookmarks?url=...`
