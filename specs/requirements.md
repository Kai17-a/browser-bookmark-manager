# 要件定義書

## はじめに

本ドキュメントは、ブラウザのブックマークを管理するWebアプリケーション向けREST APIの要件を定義する。
APIはPythonで実装し、データストアにはSQLiteを使用する。
データモデルは `bookmarks`、`folders`、`tags` の3テーブルで構成するシンプルな設計とする。

## 用語集

- **API**: ブックマーク管理アプリケーションのREST APIサーバー
- **Bookmark**: URLとそのメタデータ（タイトル、説明など）を保持するリソース
- **Folder**: ブックマークを階層的に整理するためのコンテナリソース
- **Tag**: ブックマークに付与できるラベルリソース（多対多の関係）
- **Client**: APIを呼び出すブラウザまたはフロントエンドアプリケーション
- **DB**: SQLiteデータベース（bookmarks / folders / tags テーブルを含む）

---

## 要件

### 要件1: ブックマークの作成

**ユーザーストーリー:** 開発者として、新しいブックマークを登録したい。そうすることで、URLを後から参照できるようにしたい。

#### 受け入れ基準

1. WHEN Clientが有効なURL・タイトルを含むPOSTリクエストを `/bookmarks` に送信したとき、THE API SHALL 新しいブックマークをDBに保存し、HTTPステータス201と作成されたブックマークオブジェクト（id, url, title, description, folder_id, created_at, updated_at）をレスポンスとして返す。
2. WHEN Clientが `folder_id` を指定してブックマークを作成したとき、THE API SHALL 指定されたフォルダが存在することを確認してからブックマークを保存する。
3. IF Clientが無効なURL形式（HTTPまたはHTTPSスキームを持たないURL）を送信したとき、THEN THE API SHALL HTTPステータス422とエラーメッセージをレスポンスとして返す。
4. IF Clientが `title` フィールドを省略したリクエストを送信したとき、THEN THE API SHALL HTTPステータス422とエラーメッセージをレスポンスとして返す。
5. IF Clientが存在しない `folder_id` を指定したとき、THEN THE API SHALL HTTPステータス404とエラーメッセージをレスポンスとして返す。

---

### 要件2: ブックマークの取得

**ユーザーストーリー:** 開発者として、登録済みのブックマークを取得したい。そうすることで、保存したURLを一覧・詳細表示できるようにしたい。

#### 受け入れ基準

1. WHEN Clientが `GET /bookmarks` にリクエストを送信したとき、THE API SHALL DBに存在する全ブックマークのリストをHTTPステータス200とともに返す。
2. WHEN Clientが `GET /bookmarks/{id}` にリクエストを送信したとき、THE API SHALL 指定されたIDのブックマークをHTTPステータス200とともに返す。
3. WHEN Clientが `GET /bookmarks` にクエリパラメータ `folder_id` を付与してリクエストを送信したとき、THE API SHALL 指定フォルダに属するブックマークのみを返す。
4. WHEN Clientが `GET /bookmarks` にクエリパラメータ `tag_id` を付与してリクエストを送信したとき、THE API SHALL 指定タグが付与されたブックマークのみを返す。
5. WHEN Clientが `GET /bookmarks` にクエリパラメータ `q` を付与してリクエストを送信したとき、THE API SHALL タイトルまたはURLに検索文字列を含むブックマークのみを返す。
6. IF Clientが存在しないIDを指定して `GET /bookmarks/{id}` にリクエストを送信したとき、THEN THE API SHALL HTTPステータス404とエラーメッセージをレスポンスとして返す。

---

### 要件3: ブックマークの更新

**ユーザーストーリー:** 開発者として、既存のブックマークを更新したい。そうすることで、URLやタイトルの変更を反映できるようにしたい。

#### 受け入れ基準

1. WHEN Clientが有効なフィールドを含むPATCHリクエストを `/bookmarks/{id}` に送信したとき、THE API SHALL 指定されたフィールドのみを更新し、HTTPステータス200と更新後のブックマークオブジェクトを返す。
2. WHEN Clientがブックマークを更新したとき、THE API SHALL `updated_at` フィールドを現在のUTC日時に更新する。
3. IF Clientが存在しないIDを指定してPATCHリクエストを送信したとき、THEN THE API SHALL HTTPステータス404とエラーメッセージをレスポンスとして返す。
4. IF Clientが無効なURL形式を含むPATCHリクエストを送信したとき、THEN THE API SHALL HTTPステータス422とエラーメッセージをレスポンスとして返す。

---

### 要件4: ブックマークの削除

**ユーザーストーリー:** 開発者として、不要なブックマークを削除したい。そうすることで、リストを整理できるようにしたい。

#### 受け入れ基準

1. WHEN Clientが `DELETE /bookmarks/{id}` にリクエストを送信したとき、THE API SHALL 指定されたブックマークをDBから削除し、HTTPステータス204を返す。
2. WHEN ブックマークが削除されたとき、THE API SHALL そのブックマークに関連するタグの紐付けレコード（bookmark_tags）も同時に削除する。
3. IF Clientが存在しないIDを指定してDELETEリクエストを送信したとき、THEN THE API SHALL HTTPステータス404とエラーメッセージをレスポンスとして返す。

---

### 要件5: フォルダの管理

**ユーザーストーリー:** 開発者として、ブックマークを整理するフォルダを管理したい。そうすることで、ブックマークを階層的に分類できるようにしたい。

#### 受け入れ基準

1. WHEN Clientが有効な名前を含むPOSTリクエストを `/folders` に送信したとき、THE API SHALL 新しいフォルダをDBに保存し、HTTPステータス201と作成されたフォルダオブジェクト（id, name, created_at）を返す。
2. WHEN Clientが `GET /folders` にリクエストを送信したとき、THE API SHALL 全フォルダのリストをHTTPステータス200とともに返す。
3. WHEN Clientが `DELETE /folders/{id}` にリクエストを送信したとき、THE API SHALL 指定されたフォルダをDBから削除し、HTTPステータス204を返す。
4. WHEN フォルダが削除されたとき、THE API SHALL そのフォルダに属するブックマークの `folder_id` を NULL に更新する。
5. IF Clientが `name` フィールドを省略してフォルダ作成リクエストを送信したとき、THEN THE API SHALL HTTPステータス422とエラーメッセージをレスポンスとして返す。
6. IF Clientが存在しないIDを指定してフォルダ削除リクエストを送信したとき、THEN THE API SHALL HTTPステータス404とエラーメッセージをレスポンスとして返す。

---

### 要件6: タグの管理

**ユーザーストーリー:** 開発者として、ブックマークにタグを付与・管理したい。そうすることで、カテゴリを横断してブックマークを分類できるようにしたい。

#### 受け入れ基準

1. WHEN Clientが有効な名前を含むPOSTリクエストを `/tags` に送信したとき、THE API SHALL 新しいタグをDBに保存し、HTTPステータス201と作成されたタグオブジェクト（id, name）を返す。
2. WHEN Clientが `GET /tags` にリクエストを送信したとき、THE API SHALL 全タグのリストをHTTPステータス200とともに返す。
3. WHEN Clientが `DELETE /tags/{id}` にリクエストを送信したとき、THE API SHALL 指定されたタグをDBから削除し、HTTPステータス204を返す。
4. WHEN タグが削除されたとき、THE API SHALL そのタグに関連するブックマークとの紐付けレコード（bookmark_tags）も同時に削除する。
5. IF Clientが重複するタグ名でPOSTリクエストを送信したとき、THEN THE API SHALL HTTPステータス409とエラーメッセージをレスポンスとして返す。
6. IF Clientが存在しないIDを指定してタグ削除リクエストを送信したとき、THEN THE API SHALL HTTPステータス404とエラーメッセージをレスポンスとして返す。

---

### 要件7: ブックマークへのタグ付与・解除

**ユーザーストーリー:** 開発者として、ブックマークにタグを付与または解除したい。そうすることで、柔軟な分類管理ができるようにしたい。

#### 受け入れ基準

1. WHEN Clientが有効な `tag_id` を含むPOSTリクエストを `/bookmarks/{id}/tags` に送信したとき、THE API SHALL 指定されたブックマークとタグの紐付けをDBに保存し、HTTPステータス200と更新後のブックマークオブジェクトを返す。
2. WHEN Clientが `DELETE /bookmarks/{id}/tags/{tag_id}` にリクエストを送信したとき、THE API SHALL 指定されたブックマークとタグの紐付けをDBから削除し、HTTPステータス204を返す。
3. IF Clientが既に紐付け済みのタグを再度付与しようとしたとき、THEN THE API SHALL HTTPステータス409とエラーメッセージをレスポンスとして返す。
4. IF Clientが存在しないブックマークIDまたはタグIDを指定したとき、THEN THE API SHALL HTTPステータス404とエラーメッセージをレスポンスとして返す。

---

### 要件8: データの永続化

**ユーザーストーリー:** 開発者として、全データをSQLiteに永続化したい。そうすることで、APIサーバーを再起動してもデータが失われないようにしたい。

#### 受け入れ基準

1. THE API SHALL 全データをSQLiteデータベースファイルに永続化する。
2. THE API SHALL アプリケーション起動時に、`bookmarks`・`folders`・`tags`・`bookmark_tags` テーブルが存在しない場合、自動的に作成する。
3. WHILE APIが動作中のとき、THE API SHALL 全ての書き込み操作をトランザクション内で実行し、エラー発生時にはロールバックする。
4. IF データベースへの接続または書き込みに失敗したとき、THEN THE API SHALL HTTPステータス500とエラーメッセージをレスポンスとして返す。
