# 概要

このフロントエンドは、API 経由でブックマーク、フォルダ、タグ、設定を管理する Nuxt 4 の SPA である。

## 主な特徴

- ダッシュボード型のシェルにサイドバー中心のナビゲーションを持つ
- `/settings` から取得した `api_base_url` を使って API の接続先を解決し、初期値は閲覧中ホストの `:8000` を優先する
- ブックマーク、フォルダ、タグの CRUD 画面を持つ
- フォルダとタグの詳細画面を持つ
- API 接続確認用の設定画面を持つ
- 主要な作成・編集・削除フローは E2E で確認する

## 主要ファイル

- [レイアウト](/home/kaito/workspaces/bookmark-manager/frontend/app/layouts/default.vue)
- [ブックマーク一覧](/home/kaito/workspaces/bookmark-manager/frontend/app/pages/bookmarks.vue)
- [フォルダ一覧](/home/kaito/workspaces/bookmark-manager/frontend/app/pages/folders/index.vue)
- [タグ一覧](/home/kaito/workspaces/bookmark-manager/frontend/app/pages/tags/index.vue)
- [設定画面](/home/kaito/workspaces/bookmark-manager/frontend/app/pages/settings.vue)
- [API ヘルパー](/home/kaito/workspaces/bookmark-manager/frontend/app/composables/useBookmarkApi.ts)
- [サイドバーカタログ](/home/kaito/workspaces/bookmark-manager/frontend/app/composables/useSidebarCatalog.ts)
