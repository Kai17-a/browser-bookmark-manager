# 概要

この拡張機能は、現在開いているタブのタイトルと URL を取得し、Shiori Keeper の API サーバーにブックマークを保存する Chrome Manifest V3 拡張である。

## 主な特徴

- ポップアップ UI から現在タブの情報を取得する
- API サーバー URL を `chrome.storage.local` に保存し、次回起動時に復元する
- API `/health` を使って接続確認を行う
- `/folders` と `/tags` を取得して、保存時にフォルダとタグを選択できる
- API 接続直後に現在タブの内容でブックマーク作成を試み、重複時は既存ブックマークを読み込む
- 既存ブックマークの読み込み、更新、URL による削除を行える

## 主要ファイル

- [Manifest](../../chrome-extension/manifest.json)
- [ポップアップ HTML](../../chrome-extension/popup.html)
- [ポップアップ実装](../../chrome-extension/popup.js)
- [ポップアップスタイル](../../chrome-extension/popup.css)
- [フォームスタイル](../../chrome-extension/popup-form.css)
