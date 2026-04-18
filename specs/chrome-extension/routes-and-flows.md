# ルートとフロー

この拡張機能は Web サイトのページ遷移を持たず、ポップアップ単位で完結する。

## フロー

### 初期化

1. ポップアップを開く
2. `chrome.storage.local` から API サーバー URL を読み込む
3. 現在アクティブなタブのタイトルと URL を取得する
4. `/health` を呼び出して接続状態を表示する
5. 接続成功時は `/bookmarks` への保存を即時に試みる
6. 重複 URL の場合は `/bookmarks?q=...` で既存ブックマークを取得してフォームへ反映する
7. 初回保存に成功した場合は `/folders` と `/tags` を取得して選択 UI を初期化する

### 保存

1. 現在タブのタイトル、URL、説明、フォルダ、タグを入力する
2. 保存ボタンを押す
3. 入力 URL に対して `/bookmarks?q=...` で既存ブックマークを再確認する
4. 別 ID の既存ブックマークが見つかる場合は新規保存せず、その内容をフォームへ反映する
5. 編集対象 ID がある場合は `/bookmarks/{id}` に PATCH して更新する
6. 編集対象 ID がない場合は `/bookmarks` に POST して新規作成する
7. 作成または更新に成功した場合はポップアップを閉じる

### 削除

1. 削除ボタンを押す
2. `/bookmarks?url=...` に DELETE を送る
3. 成功したらポップアップを閉じる

### 補助操作

1. API Test ボタンで `/health` を再実行する
2. Close ボタンでポップアップを閉じる
3. URL 入力変更時は `/bookmarks?q=...` で既存ブックマークを再同期する

## API 依存

- `GET /health`
- `GET /folders`
- `GET /tags`
- `GET /bookmarks?q=...`
- `POST /bookmarks`
- `PATCH /bookmarks/{id}`
- `DELETE /bookmarks?url=...`
