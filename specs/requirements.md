# 要件定義書

## はじめに

本ドキュメントは、ブックマーク管理Webアプリケーション向けREST APIの要件を定義する。
APIはPythonで実装し、データストアにはSQLiteを使用する。
データモデルは `bookmarks`、`folders`、`tags`、`bookmark_tags` の4テーブルで構成する。

## 用語集

- **API**: ブックマーク管理アプリケーションのREST APIサーバー
- **Bookmark**: URLとそのメタデータ（タイトル、説明など）を保持するリソース
- **Folder**: ブックマークを階層的に整理するためのコンテナリソース
- **Tag**: ブックマークに付与できるラベルリソース（多対多の関係）
- **Client**: APIを呼び出すブラウザまたはフロントエンドアプリケーション
- **DB**: SQLiteデータベース

---

## 要件

### 要件1: ブックマーク管理

**ユーザーストーリー:** 開発者として、ブックマークを登録・閲覧・更新・削除したい。

#### 受け入れ基準

1. WHEN Clientが有効なURL・タイトルを含むPOSTリクエストを `/bookmarks` に送信したとき、THE API SHALL 新しいブックマークをDBに保存し、HTTPステータス201と作成されたブックマークオブジェクト（id, url, title, description, folder_id, tags, created_at, updated_at）を返す。
2. WHEN Clientが `folder_id` を指定してブックマークを作成したとき、THE API SHALL 指定されたフォルダが存在することを確認してから保存する。
3. IF Clientが無効なURL形式を送信したとき、THEN THE API SHALL HTTPステータス422を返す。
4. IF Clientが `title` を省略したとき、THEN THE API SHALL HTTPステータス422を返す。
5. IF Clientが存在しない `folder_id` を指定したとき、THEN THE API SHALL HTTPステータス404を返す。
6. WHEN Clientが `GET /bookmarks` にリクエストを送信したとき、THE API SHALL ブックマーク一覧を返し、`folder_id`、`tag_id`、`q`、`page`、`per_page` による絞り込みとページングをサポートする。
7. WHEN Clientが `GET /bookmarks/{id}` にリクエストを送信したとき、THE API SHALL 指定IDのブックマークを返す。
8. WHEN Clientが `PATCH /bookmarks/{id}` にリクエストを送信したとき、THE API SHALL 指定ブックマークを部分更新し、更新後のブックマークを返す。
9. WHEN Clientが `DELETE /bookmarks/{id}` にリクエストを送信したとき、THE API SHALL 指定ブックマークを削除し、HTTPステータス204を返す。

---

### 要件2: フォルダ管理

**ユーザーストーリー:** 開発者として、ブックマークをフォルダで整理したい。

#### 受け入れ基準

1. WHEN Clientが有効な名前を含むPOSTリクエストを `/folders` に送信したとき、THE API SHALL 新しいフォルダをDBに保存し、HTTPステータス201と作成されたフォルダオブジェクト（id, name, created_at）を返す。
2. WHEN ClientがGETリクエストを `/folders` に送信したとき、THE API SHALL フォルダ一覧を返す。
3. WHEN ClientがPATCHリクエストを `/folders/{id}` に送信したとき、THE API SHALL 指定フォルダを更新し、更新後のフォルダを返す。
4. WHEN ClientがDELETEリクエストを `/folders/{id}` に送信したとき、THE API SHALL 指定フォルダを削除し、HTTPステータス204を返す。
5. IF Clientが存在しないIDを指定したとき、THEN THE API SHALL HTTPステータス404を返す。
6. WHEN フォルダが削除されたとき、THE API SHALL そのフォルダに属していたブックマークの `folder_id` を `null` に更新する。

---

### 要件3: タグ管理

**ユーザーストーリー:** 開発者として、ブックマークをタグで分類したい。

#### 受け入れ基準

1. WHEN Clientが有効な名前を含むPOSTリクエストを `/tags` に送信したとき、THE API SHALL 新しいタグをDBに保存し、HTTPステータス201と作成されたタグオブジェクト（id, name）を返す。
2. WHEN ClientがGETリクエストを `/tags` に送信したとき、THE API SHALL タグ一覧を返す。
3. WHEN ClientがPATCHリクエストを `/tags/{id}` に送信したとき、THE API SHALL 指定タグを更新し、更新後のタグを返す。
4. WHEN ClientがDELETEリクエストを `/tags/{id}` に送信したとき、THE API SHALL 指定タグを削除し、HTTPステータス204を返す。
5. IF Clientが重複するタグ名を作成または更新しようとしたとき、THEN THE API SHALL HTTPステータス409を返す。
6. IF Clientが存在しないIDを指定したとき、THEN THE API SHALL HTTPステータス404を返す。
7. WHEN タグが削除されたとき、THE API SHALL そのタグに関連する `bookmark_tags` レコードも同時に削除する。

---

### 要件4: ブックマークへのタグ付与・解除

**ユーザーストーリー:** 開発者として、ブックマークにタグを付与または解除したい。

#### 受け入れ基準

1. WHEN Clientが有効な `tag_id` を含むPOSTリクエストを `/bookmarks/{id}/tags` に送信したとき、THE API SHALL 指定されたブックマークとタグの紐付けを保存し、HTTPステータス200と更新後のブックマークオブジェクトを返す。
2. WHEN Clientが `DELETE /bookmarks/{id}/tags/{tag_id}` にリクエストを送信したとき、THE API SHALL 指定されたブックマークとタグの紐付けを削除し、HTTPステータス204を返す。
3. IF Clientが既に紐付け済みのタグを再度付与しようとしたとき、THEN THE API SHALL HTTPステータス409を返す。
4. IF Clientが存在しないブックマークIDまたはタグIDを指定したとき、THEN THE API SHALL HTTPステータス404を返す。

---

### 要件5: 永続化とエラー処理

**ユーザーストーリー:** 開発者として、データを永続化し、DB障害時に安全に失敗したい。

#### 受け入れ基準

1. THE API SHALL 全データをSQLiteデータベースファイルに永続化する。
2. THE API SHALL 起動時に `bookmarks`・`folders`・`tags`・`bookmark_tags` テーブルが存在しない場合、自動作成する。
3. WHILE APIが動作中のとき、THE API SHALL 全ての書き込み操作をトランザクション内で実行し、エラー発生時にはロールバックする。
4. IF データベースへの接続または書き込みに失敗したとき、THEN THE API SHALL HTTPステータス500を返す。
