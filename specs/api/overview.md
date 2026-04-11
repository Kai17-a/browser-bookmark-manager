# 概要

この API は、ブックマーク、フォルダ、タグ、設定を管理する FastAPI サービスである。

この配下の仕様書は、`specs/requirements.md` の要件を実装視点に分解したものとして扱う。
`specs/requirements.md` はプロダクト要件、`specs/api/` は API の入出力と挙動を中心に記述する。

## 主な特徴

- SQLite による永続化
- ブックマーク、フォルダ、タグの CRUD
- ブックマークへのタグ付与・解除
- `/settings` による API ベース URL の公開
- `/health` による疎通確認
- 例外ハンドリングと検証エラーの標準化

## 主要ファイル

- [アプリケーション本体](/home/kaito/workspaces/bookmark-manager/api/main.py)
- [DB 初期化](/home/kaito/workspaces/bookmark-manager/api/database.py)
- [ブックマークルータ](/home/kaito/workspaces/bookmark-manager/api/routers/bookmarks.py)
- [フォルダルータ](/home/kaito/workspaces/bookmark-manager/api/routers/folders.py)
- [タグルータ](/home/kaito/workspaces/bookmark-manager/api/routers/tags.py)
- [タグ付与ルータ](/home/kaito/workspaces/bookmark-manager/api/routers/bookmark_tags.py)
- [設定ルータ](/home/kaito/workspaces/bookmark-manager/api/routers/settings.py)
- [ブックマークサービス](/home/kaito/workspaces/bookmark-manager/api/services/bookmark_service.py)
- [フォルダサービス](/home/kaito/workspaces/bookmark-manager/api/services/folder_service.py)
- [タグサービス](/home/kaito/workspaces/bookmark-manager/api/services/tag_service.py)
- [モデル定義](/home/kaito/workspaces/bookmark-manager/api/model/models.py)

## 仕様の範囲

- 含めるもの
  - HTTP ルート
  - リクエスト/レスポンスの形
  - 代表的な成功・失敗パターン
  - DB 制約に起因する挙動

- 含めないもの
  - UI の見た目
  - フロントエンドの状態管理
  - 実装手順や作業順序
