# Discord Link Archive

Discordスレッドで共有されたリンクを自動収集し、美しいWebページとして公開するプロジェクトです。

[![Deploy Status](https://github.com/suginomoto/discord-link-archive/workflows/Deploy%20Discord%20Links%20to%20GitHub%20Pages/badge.svg)](https://github.com/suginomoto/discord-link-archive/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 特徴

- **完全自動化**: GitHub Actionsで毎日自動的にリンクを収集・更新
- **モダンなデザイン**: ダークモード対応のプレミアムなUI
- **レスポンシブ**: モバイル・タブレット・デスクトップに完全対応
- **詳細情報**: 投稿者、タイムスタンプ、メッセージ抜粋を表示
- **統計情報**: リンク数、投稿者数などの統計を自動集計
- **GitHub Pages**: 無料で高速なホスティング

## 技術スタック

- **Node.js** - サーバーサイドJavaScript実行環境
- **discord.js** - Discord Bot API
- **GitHub Actions** - CI/CDパイプライン
- **GitHub Pages** - 静的サイトホスティング

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/suginomoto/discord-link-archive.git
cd discord-link-archive
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

以下の環境変数を設定してください:

- `DISCORD_BOT_TOKEN`: Discord Botのトークン
- `TARGET_THREAD_ID`: 監視するDiscordスレッドのID

### 4. ローカルでの実行

```bash
# リンクを取得
npm run fetch

# HTMLページを生成
npm run generate

# または一括実行
npm run build
```

## GitHub Actionsでの自動デプロイ

このプロジェクトは、GitHub Actionsを使用して自動的にデプロイされます。

### 必要なシークレットの設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定:

1. `DISCORD_BOT_TOKEN` - Discord Botトークン
2. `TARGET_THREAD_ID` - 監視するスレッドID

### デプロイスケジュール

- **自動実行**: 毎日 08:00 UTC (17:00 JST)
- **手動実行**: Actionsタブから随時実行可能

## プロジェクト構造

```
discord-link-archive/
├── .github/
│   └── workflows/
│       └── main.yml          # GitHub Actionsワークフロー
├── data/
│   └── links.json            # 収集されたリンクデータ
├── icon/
│   └── *.png                 # アイコン画像
├── fetch_links.js            # Discordからリンクを取得
├── generate_page.js          # HTMLページを生成
├── index.html                # 生成されたWebページ
└── package.json              # プロジェクト設定
```

## 今後の予定

### 近日実装予定

- リアルタイム更新: Webhookを使用した即時更新機能(検討中)
- デザイン改良: より洗練されたUIとアニメーション
- 検索機能: リンクやドメインでの絞り込み検索
- タグ機能: カテゴリ別のリンク分類
- 高度な統計: ドメイン別集計、時系列グラフなど
- データエクスポート: JSON/CSV形式でのエクスポート
- 多言語対応: 英語・日本語の切り替え

### 検討中の機能

- リンク先のプレビュー画像表示
- お気に入り機能
- 新規リンク通知
- PWA対応

## コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## ライセンス

[ISC License](https://opensource.org/licenses/ISC)

## 謝辞

- [discord.js](https://discord.js.org/) - Discord Bot開発フレームワーク
- [GitHub Actions](https://github.com/features/actions) - CI/CDプラットフォーム
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) - GitHub Pagesデプロイアクション

---

Made with ❤️ by [suginomoto](https://github.com/suginomoto)