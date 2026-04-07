# 実装計画: ブックマーク管理API

## 概要

Router / Service / Repository の3層構成で、FastAPI + SQLite によるブックマーク管理REST APIを段階的に実装する。
各タスクは前のタスクの成果物を積み上げる形で進め、最終的に全コンポーネントを結合する。

## タスク

- [x] 1. プロジェクト基盤のセットアップ
  - `app/` および `tests/` ディレクトリ構成を作成する
  - `requirements.txt` に FastAPI・uvicorn・pydantic・pytest・hypothesis を記載する
  - `app/database.py` にDB接続・`PRAGMA foreign_keys = ON`・`get_db()` コンテキストマネージャを実装する
  - アプリ起動時に `bookmarks`・`folders`・`tags`・`bookmark_tags` テーブルを自動作成する `init_db()` を実装する
  - `app/main.py` に FastAPI アプリを初期化し、起動時に `init_db()` を呼び出す
  - _要件: 8.1, 8.2, 8.3_

  - [x]* 1.1 DBテーブル自動作成のユニットテストを作成する
    - 新規DBファイルで `init_db()` を呼び出した後、全4テーブルが存在することを確認する
    - _要件: 8.2_

- [x] 2. Pydanticスキーマの定義
  - `app/models.py` にリクエスト・レスポンス用 Pydantic v2 スキーマを実装する
  - `BookmarkCreate`（`AnyHttpUrl` 型でURL検証）・`BookmarkUpdate`・`BookmarkResponse` を定義する
  - `FolderCreate`・`FolderResponse`・`TagCreate`・`TagResponse`・`TagAttach` を定義する
  - _要件: 1.3, 1.4, 3.4, 5.5_

- [ ] 3. フォルダ機能の実装
  - [x] 3.1 `app/repositories/folder_repo.py` を実装する
    - `insert(name)`・`find_all()`・`find_by_id(id)`・`delete(id)` メソッドを実装する
    - 全書き込み操作をトランザクション内で実行し、エラー時にロールバックする
    - _要件: 5.1, 5.2, 5.3, 5.4, 8.3_

  - [x] 3.2 `app/services/folder_service.py` を実装する
    - `create(data)`・`list()`・`delete(folder_id)` メソッドを実装する
    - 存在しないIDへの操作時に `HTTPException(404)` を送出する
    - _要件: 5.1, 5.2, 5.3, 5.6_

  - [x] 3.3 `app/routers/folders.py` を実装する
    - `POST /folders`（201）・`GET /folders`（200）・`DELETE /folders/{id}`（204）を実装する
    - `FolderService` を `Depends` で依存注入する
    - _要件: 5.1, 5.2, 5.3, 5.5, 5.6_

  - [x]* 3.4 フォルダAPIのユニットテストを作成する（`tests/test_folders.py`）
    - 正常系: 作成・一覧取得・削除
    - 異常系: `name` 省略で422、存在しないIDで404
    - _要件: 5.1, 5.2, 5.3, 5.5, 5.6_

- [ ] 4. タグ機能の実装
  - [x] 4.1 `app/repositories/tag_repo.py` を実装する
    - `insert(name)`・`find_all()`・`find_by_id(id)`・`delete(id)` メソッドを実装する
    - `IntegrityError` をキャッチして重複タグ名を検出できるようにする
    - _要件: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.2 `app/services/tag_service.py` を実装する
    - `create(data)`・`list()`・`delete(tag_id)` メソッドを実装する
    - 重複タグ名時に `HTTPException(409)`、存在しないIDに `HTTPException(404)` を送出する
    - _要件: 6.1, 6.2, 6.3, 6.5, 6.6_

  - [x] 4.3 `app/routers/tags.py` を実装する
    - `POST /tags`（201）・`GET /tags`（200）・`DELETE /tags/{id}`（204）を実装する
    - _要件: 6.1, 6.2, 6.3, 6.5, 6.6_

  - [x]* 4.4 タグAPIのユニットテストを作成する（`tests/test_tags.py`）
    - 正常系: 作成・一覧取得・削除
    - 異常系: 重複タグ名で409、存在しないIDで404
    - _要件: 6.1, 6.2, 6.3, 6.5, 6.6_

- [x] 5. チェックポイント - フォルダ・タグの動作確認
  - 全テストがパスすることを確認する。問題があればユーザーに確認する。

- [ ] 6. ブックマーク機能の実装
  - [x] 6.1 `app/repositories/bookmark_repo.py` を実装する
    - `insert()`・`find_all(folder_id, tag_id, q)`・`find_by_id()`・`update()`・`delete()` を実装する
    - `add_tag()`・`remove_tag()`・`get_tags()` を実装する
    - `find_all` のフィルタ: `folder_id`・`tag_id` は JOIN、`q` は `LIKE` 検索
    - `delete` 時は `ON DELETE CASCADE` により `bookmark_tags` が自動削除されることを前提とする
    - _要件: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 4.1, 4.2, 7.1, 7.2, 8.3_

  - [x] 6.2 `app/services/bookmark_service.py` を実装する
    - `create(data)`・`list()`・`get(id)`・`update(id, data)`・`delete(id)` を実装する
    - `add_tag(bookmark_id, tag_id)`・`remove_tag(bookmark_id, tag_id)` を実装する
    - `folder_id` 指定時はフォルダ存在確認を行い、存在しない場合は `HTTPException(404)` を送出する
    - タグ重複付与時に `HTTPException(409)` を送出する
    - _要件: 1.2, 1.5, 2.6, 3.3, 4.3, 7.3, 7.4_

  - [x] 6.3 `app/routers/bookmarks.py` と `app/routers/bookmark_tags.py` を実装する
    - `POST /bookmarks`・`GET /bookmarks`・`GET /bookmarks/{id}`・`PATCH /bookmarks/{id}`・`DELETE /bookmarks/{id}` を実装する
    - `GET /bookmarks` のクエリパラメータ `folder_id`・`tag_id`・`q` を受け付ける
    - `POST /bookmarks/{id}/tags`・`DELETE /bookmarks/{id}/tags/{tag_id}` を実装する
    - `app/main.py` に全ルーターを登録する
    - _要件: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 4.1, 7.1, 7.2_

  - [x]* 6.4 ブックマークAPIのユニットテストを作成する（`tests/test_bookmarks.py`）
    - 正常系: 作成・一覧・詳細・更新・削除・タグ付与・タグ解除
    - 異常系: `title` 省略で422、無効URLで422、存在しないIDで404、存在しない `folder_id` で404
    - タグ重複付与で409
    - _要件: 1.1〜1.5, 2.1〜2.6, 3.1〜3.4, 4.1〜4.3, 7.1〜7.4_

- [x] 7. チェックポイント - ブックマーク機能の動作確認
  - 全テストがパスすることを確認する。問題があればユーザーに確認する。

- [x] 8. プロパティベーステストの実装（`tests/test_properties.py`）
  - [x]* 8.1 Property 1: ブックマーク作成のラウンドトリップ
    - **Property 1: ブックマーク作成のラウンドトリップ**
    - **Validates: Requirements 1.1, 2.2**

  - [x]* 8.2 Property 2: 無効URLのバリデーション拒否
    - **Property 2: 無効URLのバリデーション拒否**
    - **Validates: Requirements 1.3, 3.4**

  - [x]* 8.3 Property 3: 存在しないリソースへのアクセスは404
    - **Property 3: 存在しないリソースへのアクセスは404**
    - **Validates: Requirements 1.5, 2.6, 3.3, 4.3, 5.6, 6.6, 7.4**

  - [x]* 8.4 Property 4: フォルダフィルタの正確性
    - **Property 4: フォルダフィルタの正確性**
    - **Validates: Requirements 2.3**

  - [x]* 8.5 Property 5: タグフィルタの正確性
    - **Property 5: タグフィルタの正確性**
    - **Validates: Requirements 2.4**

  - [x]* 8.6 Property 6: キーワード検索の正確性
    - **Property 6: キーワード検索の正確性**
    - **Validates: Requirements 2.5**

  - [x]* 8.7 Property 7: 部分更新の不変性
    - **Property 7: 部分更新の不変性**
    - **Validates: Requirements 3.1, 3.2**

  - [x]* 8.8 Property 8: ブックマーク削除とカスケード
    - **Property 8: ブックマーク削除とカスケード**
    - **Validates: Requirements 4.1, 4.2**

  - [x]* 8.9 Property 9: フォルダ削除後のブックマーク参照解除
    - **Property 9: フォルダ削除後のブックマーク参照解除**
    - **Validates: Requirements 5.4**

  - [x]* 8.10 Property 10: タグ名の一意性
    - **Property 10: タグ名の一意性**
    - **Validates: Requirements 6.5**

  - [x]* 8.11 Property 11: タグ付与・解除のラウンドトリップ
    - **Property 11: タグ付与・解除のラウンドトリップ**
    - **Validates: Requirements 7.1, 7.2**

  - [x]* 8.12 Property 12: タグの重複付与は409
    - **Property 12: タグの重複付与は409**
    - **Validates: Requirements 7.3**

- [x] 9. エラーハンドリングとグローバル例外ハンドラの実装
  - `app/main.py` にグローバル例外ハンドラを追加し、予期しないDBエラーを500に変換する
  - エラーログにスタックトレースを記録する処理を追加する
  - _要件: 8.4_

  - [x]* 9.1 DBエラー時の500レスポンスのユニットテストを作成する
    - DB接続をモックして例外を発生させ、500が返ることを確認する
    - _要件: 8.4_

- [x] 10. 最終チェックポイント - 全テストパスの確認
  - 全テストがパスすることを確認する。問題があればユーザーに確認する。

## 備考

- `*` が付いたサブタスクはオプションであり、MVP優先の場合はスキップ可能
- 各タスクは要件番号でトレーサビリティを確保している
- プロパティテストは `@settings(max_examples=100)` で最低100回実行する
- テスト用DBはインメモリSQLite（`:memory:`）を使用し、テスト間の独立性を保つ
