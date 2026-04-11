# テスト観点

## 単体テスト

- `api/tests/test_database.py`
  - 全テーブルの自動作成
  - 初期化の冪等性
  - DB 障害時の 500 応答

- `api/tests/test_bookmarks.py`
  - 作成、一覧、詳細、更新、削除
  - 検索、絞り込み、ページング
  - フォルダ関連付け
  - タグ付与・解除
  - バリデーションと重複エラー
  - タグ集合の置き換え

- `api/tests/test_folders.py`
  - 作成、一覧、更新、削除
  - 参照先更新と 404 応答
  - フォルダ上限

- `api/tests/test_tags.py`
  - 作成、一覧、更新、削除
  - 重複エラーと 404 応答
  - タグ上限

## ルート単位の確認観点

- `POST /bookmarks`
  - 正常作成
  - `folder_id` の存在確認
  - `tag_ids` の重複拒否
  - 既存 URL の 409

- `GET /bookmarks`
  - デフォルトページング
  - `page` と `per_page`
  - `folder_id`、`tag_id`、`q` の絞り込み

- `PATCH /bookmarks/{id}`
  - 部分更新
  - タグ集合の置き換え
  - 404 と 409

- `POST /folders` / `POST /tags`
  - 正常作成
  - 空文字拒否
  - 上限超過

- `PATCH /folders/{id}` / `PATCH /tags/{id}`
  - 名前更新
  - 重複名 409
  - 存在しない ID の 404

- `POST /bookmarks/{id}/tags`
  - 紐付け追加
  - 重複紐付け 409
  - 存在しない bookmark/tag の 404

- `DELETE /bookmarks/{id}/tags/{tag_id}`
  - 紐付け解除
  - 存在しない bookmark/tag の 404

## プロパティテスト

- `api/tests/test_properties.py`
  - 作成のラウンドトリップ
  - 無効 URL の拒否
  - 存在しないリソースの 404
  - フォルダ/タグフィルタの正確性
  - キーワード検索の正確性
  - 部分更新の不変性
  - 削除とカスケード
  - タグ付与・解除のラウンドトリップ

## 未カバー範囲

- OpenAPI ドキュメントのスナップショット
- 同時実行時の競合テスト
- 低レベルの SQLite パフォーマンス検証
