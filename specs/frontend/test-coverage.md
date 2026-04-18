# テスト観点

## 単体テスト

- `frontend/tests/bookmarkApi.test.ts`
  - Trailing slash trimming
  - API base fallback resolution
  - Request header construction
  - Error message normalization
  - Frontend API path coverage including bookmarks, folders, tags, RSS feeds, metrics, and settings

- `frontend/tests/sidebarCatalog.test.ts`
  - Empty sidebar state creation
  - Catalog result application

## E2E テスト

- `frontend/tests/e2e/bookmark-manager.spec.ts`
  - Bookmark create, edit, search, delete
  - Folder create, rename, detail, delete
  - Tag create, rename, detail, delete
  - RSS feed create, edit, detail navigation, delete
  - Settings page load and theme toggle

## 未カバー範囲

- ページ/コンポーネント単体のテストはない
- 設定画面の webhook 保存や RSS 定期実行切り替えを直接検証するテストはない
- ブックマークのフォルダ/タグ割り当てを UI で追う明示的なテストはない
- オフラインやバックエンド停止時の描画を、手動のエラー処理以外で明示的に検証するテストはない

## 追加ルール

- フロントエンドに共通 `fetcher` や API 基盤のような横断的な実装を追加した場合は、対応する unit テストか e2e テストも同時に追加する
