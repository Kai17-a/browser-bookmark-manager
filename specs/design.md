# 技術設計書: ブックマーク管理API

## 概要

本ドキュメントは、ブックマーク管理REST APIの技術設計を定義する。
PythonでAPIサーバーを実装し、SQLiteをデータストアとして使用する。
ブックマーク・フォルダ・タグのCRUD操作と、ブックマークへのタグ付与・解除機能を提供する。

### 技術スタック

- 言語: Python 3.11+
- Webフレームワーク: FastAPI
- バリデーション: Pydantic v2
- DB: SQLite（標準ライブラリ `sqlite3` を使用）
- テスト: pytest + hypothesis（プロパティベーステスト）

FastAPIを選択した理由:
- Pydanticによる入力バリデーションが組み込みで提供される
- OpenAPI仕様の自動生成により、APIドキュメントが自動で作成される
- 非同期対応が容易で、将来的な拡張性が高い

---

## アーキテクチャ

### レイヤー構成

```
Client (HTTP)
    │
    ▼
┌─────────────────────────────┐
│  Router Layer (FastAPI)     │  ← HTTPルーティング・リクエスト受付
│  app/routers/               │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Service Layer              │  ← ビジネスロジック・バリデーション
│  app/services/              │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Repository Layer           │  ← DB操作の抽象化
│  app/repositories/          │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  SQLite Database            │  ← データ永続化
│  bookmarks.db               │
└─────────────────────────────┘
```

### ディレクトリ構成

```
bookmark-manager-api/
├── app/
│   ├── main.py               # FastAPIアプリケーション初期化・起動
│   ├── database.py           # DB接続・テーブル初期化
│   ├── models.py             # Pydanticスキーマ（Request/Response）
│   ├── routers/
│   │   ├── bookmarks.py      # /bookmarks エンドポイント
│   │   ├── folders.py        # /folders エンドポイント
│   │   ├── tags.py           # /tags エンドポイント
│   │   └── bookmark_tags.py  # /bookmarks/{id}/tags エンドポイント
│   ├── services/
│   │   ├── bookmark_service.py
│   │   ├── folder_service.py
│   │   └── tag_service.py
│   └── repositories/
│       ├── bookmark_repo.py
│       ├── folder_repo.py
│       └── tag_repo.py
└── tests/
    ├── test_bookmarks.py
    ├── test_folders.py
    ├── test_tags.py
    └── test_properties.py    # プロパティベーステスト
```

---

## コンポーネントとインターフェース

### APIエンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /bookmarks | ブックマーク作成 |
| GET | /bookmarks | ブックマーク一覧取得（フィルタ対応） |
| GET | /bookmarks/{id} | ブックマーク詳細取得 |
| PATCH | /bookmarks/{id} | ブックマーク更新 |
| DELETE | /bookmarks/{id} | ブックマーク削除 |
| POST | /folders | フォルダ作成 |
| GET | /folders | フォルダ一覧取得 |
| DELETE | /folders/{id} | フォルダ削除 |
| POST | /tags | タグ作成 |
| GET | /tags | タグ一覧取得 |
| DELETE | /tags/{id} | タグ削除 |
| POST | /bookmarks/{id}/tags | タグ付与 |
| DELETE | /bookmarks/{id}/tags/{tag_id} | タグ解除 |

### Routerインターフェース

各Routerは対応するServiceを依存注入（FastAPIの `Depends`）で受け取る。

```python
# 例: bookmarks router
@router.post("/bookmarks", status_code=201, response_model=BookmarkResponse)
def create_bookmark(body: BookmarkCreate, service: BookmarkService = Depends(get_bookmark_service)):
    return service.create(body)
```

### Serviceインターフェース

```python
class BookmarkService:
    def create(self, data: BookmarkCreate) -> BookmarkResponse
    def list(self, folder_id: int | None, tag_id: int | None, q: str | None) -> list[BookmarkResponse]
    def get(self, bookmark_id: int) -> BookmarkResponse
    def update(self, bookmark_id: int, data: BookmarkUpdate) -> BookmarkResponse
    def delete(self, bookmark_id: int) -> None
    def add_tag(self, bookmark_id: int, tag_id: int) -> BookmarkResponse
    def remove_tag(self, bookmark_id: int, tag_id: int) -> None

class FolderService:
    def create(self, data: FolderCreate) -> FolderResponse
    def list(self) -> list[FolderResponse]
    def delete(self, folder_id: int) -> None

class TagService:
    def create(self, data: TagCreate) -> TagResponse
    def list(self) -> list[TagResponse]
    def delete(self, tag_id: int) -> None
```

### Repositoryインターフェース

```python
class BookmarkRepository:
    def insert(self, url: str, title: str, description: str | None, folder_id: int | None) -> dict
    def find_all(self, folder_id: int | None, tag_id: int | None, q: str | None) -> list[dict]
    def find_by_id(self, bookmark_id: int) -> dict | None
    def update(self, bookmark_id: int, fields: dict) -> dict | None
    def delete(self, bookmark_id: int) -> bool
    def add_tag(self, bookmark_id: int, tag_id: int) -> None
    def remove_tag(self, bookmark_id: int, tag_id: int) -> None
    def get_tags(self, bookmark_id: int) -> list[dict]
```

---

## データモデル

### DBスキーマ

```sql
CREATE TABLE IF NOT EXISTS folders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    url         TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    description TEXT,
    folder_id   INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS bookmark_tags (
    bookmark_id INTEGER NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id      INTEGER NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
    PRIMARY KEY (bookmark_id, tag_id)
);
```

設計上の決定事項:
- `folders.id` の外部キーに `ON DELETE SET NULL` を設定し、フォルダ削除時にブックマークの `folder_id` を自動的にNULLにする
- `bookmark_tags` の外部キーに `ON DELETE CASCADE` を設定し、ブックマークまたはタグ削除時に紐付けレコードを自動削除する
- SQLiteのFOREIGN KEY制約は `PRAGMA foreign_keys = ON` で有効化する必要があるため、接続時に必ず実行する

### Pydanticスキーマ

```python
# リクエスト
class BookmarkCreate(BaseModel):
    url: AnyHttpUrl
    title: str
    description: str | None = None
    folder_id: int | None = None

class BookmarkUpdate(BaseModel):
    url: AnyHttpUrl | None = None
    title: str | None = None
    description: str | None = None
    folder_id: int | None = None

class FolderCreate(BaseModel):
    name: str

class TagCreate(BaseModel):
    name: str

class TagAttach(BaseModel):
    tag_id: int

# レスポンス
class TagResponse(BaseModel):
    id: int
    name: str

class FolderResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

class BookmarkResponse(BaseModel):
    id: int
    url: str
    title: str
    description: str | None
    folder_id: int | None
    tags: list[TagResponse]
    created_at: datetime
    updated_at: datetime
```

### エラーレスポンス

全エラーは以下の統一フォーマットで返す:

```json
{
  "detail": "エラーメッセージ"
}
```

FastAPIのデフォルト例外ハンドラ（`HTTPException`）がこの形式を自動的に生成する。


---

## 正確性プロパティ

*プロパティとは、システムの全ての有効な実行において成立すべき特性または振る舞いのことである。本質的には、システムが何をすべきかについての形式的な記述である。プロパティは人間が読める仕様と機械で検証可能な正確性保証の橋渡しをする。*

### Property 1: ブックマーク作成のラウンドトリップ

*For any* 有効なURL・タイトル・オプションフィールドの組み合わせに対して、POSTで作成したブックマークをGETで取得した場合、レスポンスに同じURL・タイトル・descriptionが含まれること。

**Validates: Requirements 1.1, 2.2**

### Property 2: 無効URLのバリデーション拒否

*For any* HTTPまたはHTTPSスキームを持たない文字列（例: `ftp://...`、`not-a-url`、空文字列）をURLとして送信した場合、APIは常にHTTPステータス422を返すこと。

**Validates: Requirements 1.3, 3.4**

### Property 3: 存在しないリソースへのアクセスは404

*For any* DBに存在しないID（例: 負の値、未使用の大きな整数）を指定してGET/PATCH/DELETE/タグ操作を行った場合、APIは常にHTTPステータス404を返すこと。

**Validates: Requirements 1.5, 2.6, 3.3, 4.3, 5.6, 6.6, 7.4**

### Property 4: フォルダフィルタの正確性

*For any* 複数のフォルダとブックマークの組み合わせに対して、`GET /bookmarks?folder_id=X` で取得した全ブックマークの `folder_id` が X であること。

**Validates: Requirements 2.3**

### Property 5: タグフィルタの正確性

*For any* 複数のタグとブックマークの組み合わせに対して、`GET /bookmarks?tag_id=X` で取得した全ブックマークが タグID X を持つこと。

**Validates: Requirements 2.4**

### Property 6: キーワード検索の正確性

*For any* 検索文字列 `q` に対して、`GET /bookmarks?q=<q>` で取得した全ブックマークのtitleまたはurlに `q` が含まれること。

**Validates: Requirements 2.5**

### Property 7: 部分更新の不変性

*For any* ブックマークと更新フィールドの組み合わせに対して、PATCHリクエストで指定したフィールドのみが変更され、指定しなかったフィールドは変更前の値を保持すること。

**Validates: Requirements 3.1, 3.2**

### Property 8: ブックマーク削除とカスケード

*For any* タグが付与されたブックマークを削除した場合、そのブックマークはGETで404になり、かつ `bookmark_tags` テーブルに関連レコードが残存しないこと。

**Validates: Requirements 4.1, 4.2**

### Property 9: フォルダ削除後のブックマーク参照解除

*For any* フォルダとそのフォルダに属するブックマークの組み合わせに対して、フォルダを削除した後、そのブックマークの `folder_id` が NULL になること。

**Validates: Requirements 5.4**

### Property 10: タグ名の一意性

*For any* 既存のタグ名と同じ名前でPOSTリクエストを送信した場合、APIは常にHTTPステータス409を返すこと。

**Validates: Requirements 6.5**

### Property 11: タグ付与・解除のラウンドトリップ

*For any* ブックマークとタグの組み合わせに対して、タグを付与した後に解除した場合、ブックマークのtagsリストが付与前と同じ状態に戻ること。

**Validates: Requirements 7.1, 7.2**

### Property 12: タグの重複付与は409

*For any* 既にタグが付与されているブックマークに対して、同じタグを再度付与しようとした場合、APIは常にHTTPステータス409を返すこと。

**Validates: Requirements 7.3**

---

## エラーハンドリング

### HTTPステータスコードの対応表

| 状況 | ステータスコード |
|------|----------------|
| リソース作成成功 | 201 Created |
| 取得・更新成功 | 200 OK |
| 削除成功 | 204 No Content |
| リソースが存在しない | 404 Not Found |
| バリデーションエラー（型・形式） | 422 Unprocessable Entity |
| 重複エラー（タグ名・タグ付与） | 409 Conflict |
| DBエラー | 500 Internal Server Error |

### エラーハンドリング戦略

**バリデーションエラー (422)**
- PydanticのバリデーションはFastAPIが自動的に処理する
- `AnyHttpUrl` 型によりHTTP/HTTPSスキームの検証を行う
- 必須フィールドの欠落はPydanticが自動検出する

**404 Not Found**
- ServiceレイヤーでRepositoryの返り値が `None` の場合に `HTTPException(404)` を送出する

**409 Conflict**
- タグ名の重複: SQLiteの `UNIQUE` 制約違反（`IntegrityError`）をキャッチして409に変換する
- タグの重複付与: `bookmark_tags` の `PRIMARY KEY` 制約違反をキャッチして409に変換する

**500 Internal Server Error**
- DB接続失敗・予期しないSQLエラーはグローバル例外ハンドラでキャッチして500を返す
- エラーログにスタックトレースを記録する

### トランザクション管理

全ての書き込み操作（INSERT/UPDATE/DELETE）はコンテキストマネージャを使用してトランザクションを管理する:

```python
def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
```

---

## テスト戦略

### デュアルテストアプローチ

ユニットテストとプロパティベーステストを組み合わせて包括的なカバレッジを実現する。

- **ユニットテスト**: 具体的な例・エッジケース・エラー条件を検証する
- **プロパティテスト**: 全入力に対して成立すべき普遍的なプロパティを検証する

### プロパティベーステストの設定

- ライブラリ: **Hypothesis**（Python向けプロパティベーステストライブラリ）
- 最小イテレーション数: 各プロパティテストにつき **100回以上**（`@settings(max_examples=100)` で設定）
- 各テストには設計書のプロパティを参照するコメントを付与する
- タグ形式: `# Feature: bookmark-manager-api, Property {番号}: {プロパティ名}`

### ユニットテスト

ユニットテストは具体的な例とエッジケースに集中する。プロパティテストが広範な入力をカバーするため、ユニットテストは過剰に書かない。

対象:
- 各エンドポイントの正常系（具体的な入力例）
- エッジケース: `title` 省略、`name` 省略、存在しないID
- DBエラー時の500レスポンス（モックを使用）
- テーブルの自動作成（新規DBファイルでの起動）

```python
# 例: ユニットテスト
def test_create_bookmark_without_title_returns_422(client):
    response = client.post("/bookmarks", json={"url": "https://example.com"})
    assert response.status_code == 422

def test_get_nonexistent_bookmark_returns_404(client):
    response = client.get("/bookmarks/99999")
    assert response.status_code == 404
```

### プロパティベーステスト

各設計プロパティに対して1つのプロパティテストを実装する。

```python
from hypothesis import given, settings, strategies as st

# Feature: bookmark-manager-api, Property 1: ブックマーク作成のラウンドトリップ
@given(
    url=st.from_regex(r'https?://[a-z]{3,10}\.[a-z]{2,4}(/[a-z]*)?', fullmatch=True),
    title=st.text(min_size=1, max_size=100)
)
@settings(max_examples=100)
def test_property_1_bookmark_create_roundtrip(client, url, title):
    response = client.post("/bookmarks", json={"url": url, "title": title})
    assert response.status_code == 201
    data = response.json()
    bookmark_id = data["id"]
    get_response = client.get(f"/bookmarks/{bookmark_id}")
    assert get_response.status_code == 200
    assert get_response.json()["title"] == title

# Feature: bookmark-manager-api, Property 2: 無効URLのバリデーション拒否
@given(url=st.one_of(
    st.text(min_size=1).filter(lambda s: not s.startswith(("http://", "https://"))),
    st.just("ftp://example.com"),
    st.just("not-a-url"),
))
@settings(max_examples=100)
def test_property_2_invalid_url_returns_422(client, url):
    response = client.post("/bookmarks", json={"url": url, "title": "test"})
    assert response.status_code == 422

# Feature: bookmark-manager-api, Property 4: フォルダフィルタの正確性
@given(folder_count=st.integers(min_value=1, max_value=5),
       bookmark_count=st.integers(min_value=1, max_value=10))
@settings(max_examples=100)
def test_property_4_folder_filter_accuracy(client, folder_count, bookmark_count):
    # フォルダとブックマークを作成し、フィルタ結果が正確であることを確認
    ...
```

### テストの実行

```bash
# ユニットテスト
pytest tests/ -v

# プロパティテストのみ
pytest tests/test_properties.py -v

# カバレッジ付き
pytest tests/ --cov=app --cov-report=term-missing
```
