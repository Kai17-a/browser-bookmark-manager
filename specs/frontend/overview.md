# 概要

このフロントエンドは、API 経由でブックマーク、フォルダ、タグを管理する Nuxt 4 の SPA である。

## 主な特徴

- ダッシュボード型のシェルにサイドバー中心のナビゲーションを持つ
- ブックマーク、フォルダ、タグの CRUD 画面を持つ
- フォルダとタグの詳細画面を持つ
- API 接続確認用の設定画面を持つ
- 主要な作成・編集・削除フローは E2E で確認する

## 主要ファイル

- [レイアウト](../../frontend/app/layouts/default.vue)
- [ブックマーク一覧](../../frontend/app/pages/bookmarks.vue)
- [フォルダ一覧](../../frontend/app/pages/folders/index.vue)
- [タグ一覧](../../frontend/app/pages/tags/index.vue)
- [API ヘルパー](../../frontend/app/composables/useBookmarkApi.ts)
- [サイドバーカタログ](../../frontend/app/composables/useSidebarCatalog.ts)
