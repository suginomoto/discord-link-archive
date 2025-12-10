# Discord Link Archive

Discordスレッドで共有されたリンクを自動収集し、美しいWebページとして公開するプロジェクトです。

[![Deploy Status](https://github.com/suginomoto/discord-link-archive/workflows/Deploy%20Discord%20Links%20to%20GitHub%20Pages/badge.svg)](https://github.com/suginomoto/discord-link-archive/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## ✨ 特徴

### コア機能
- **完全自動化**: GitHub Actionsで毎日自動的にリンクを収集・更新
- **メタデータ自動取得**: リンク先のタイトル・説明文を自動取得して表示
- **スクリーンショット自動表示**: リンク先のプレビュー画像を常時表示（Puppeteer使用）
- **タグ自動生成**: コンテンツを分析して自動的にタグ付け
- **多言語対応**: 説明文を日本語に自動翻訳

### UI/UX機能
- **クリッカブルカード**: カード全体をクリックしてリンク先に移動可能
- **タグ折りたたみ**: タグが多い場合は自動的に折りたたみ、展開ボタンで表示
- **タグフィルター**: タグをクリックして関連リンクを絞り込み表示
- **お気に入り機能**: ローカルストレージを使用したお気に入り管理
- **ナビゲーション**: home、tags、お気に入りフィルターへの簡単アクセス

### レスポンシブデザイン
- **デスクトップ**: 4列グリッドレイアウト
- **タブレット**: 2-3列の自動調整
- **スマートフォン**: 2列表示で最適化
  - ヘッダーが画面に収まるよう調整
  - 横スクロールなしで全コンテンツ表示
  - タッチ操作に最適化

### デザイン
- **モダンなダークモード**: プレミアムなUI/UX
- **詳細な統計情報**: リンク数、投稿者数、タグ数、ドメイン数を表示
- **スムーズなアニメーション**: ホバーエフェクトとトランジション

## 🛠️ 技術スタック

- **Node.js** - サーバーサイドJavaScript実行環境
- **discord.js** - Discord Bot API
- **Puppeteer** - スクリーンショット自動キャプチャ
- **Axios & Cheerio** - メタデータ取得
- **Google Translate API** - 自動翻訳
- **GitHub Actions** - CI/CDパイプライン
- **GitHub Pages** - 静的サイトホスティング

## 📦 セットアップ

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

# メタデータを取得
npm run metadata

# タグを生成
npm run tags

# スクリーンショットを取得
npm run screenshots

# HTMLページを生成
npm run generate

# または一括実行
npm run build
```

## 🚀 GitHub Actionsでの自動デプロイ

このプロジェクトは、GitHub Actionsを使用して自動的にデプロイされます。

### 必要なシークレットの設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定:

1. `DISCORD_BOT_TOKEN` - Discord Botトークン
2. `TARGET_THREAD_ID` - 監視するスレッドID

### デプロイスケジュール

- **自動実行**: 毎日 08:00 UTC (17:00 JST)
- **手動実行**: Actionsタブから随時実行可能

## 📁 プロジェクト構造

```
discord-link-archive/
├── .github/
│   └── workflows/
│       └── main.yml              # GitHub Actionsワークフロー
├── data/
│   └── links.json                # 収集されたリンクデータ
├── screenshots/
│   └── *.jpg                     # スクリーンショット画像
├── fetch_links.js                # Discordからリンクを取得
├── fetch_metadata.js             # メタデータを取得
├── generate_tags.js              # タグを自動生成
├── generate_tags_page.js         # タグページを生成
├── capture_screenshots.js        # スクリーンショットを取得
├── generate_page.js              # HTMLページを生成
├── index.html                    # 生成されたメインページ
├── tags.html                     # 生成されたタグページ
└── package.json                  # プロジェクト設定
```

## 🔧 トラブルシューティング

### GitHub Actionsでのビルドエラー

#### `libasound2` パッケージが見つからない

Ubuntu 24.04では、`libasound2` パッケージ名が `libasound2t64` に変更されています。

**解決済み**: 本プロジェクトの `.github/workflows/main.yml` では既に対応済みです。

以下のパッケージがインストールされます:
- `libnss3`
- `libatk-bridge2.0-0`
- `libdrm2`
- `libxkbcommon0`
- `libgbm1`
- `libasound2t64` ← Ubuntu 24.04対応
- `libgtk-3-0`
- `libxshmfence1`
- `libglu1-mesa`

### ローカルでのPuppeteerエラー

ローカル環境でスクリーンショット取得時にエラーが発生する場合:

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser
# または上記のパッケージリストを手動インストール
```

**macOS**:
```bash
brew install chromium
```

**Windows**:
Puppeteerが自動的にChromiumをダウンロードするため、通常は追加設定不要です。

## 🎯 主な機能の使い方

### お気に入り機能
- 各リンクカードの右上にある星アイコン(☆)をクリックしてお気に入りに追加
- ナビゲーションバーの「★ お気に入りのみ」をクリックしてフィルター表示
- お気に入りはブラウザのローカルストレージに保存

### タグフィルター
- カード内のタグをクリックして関連リンクを絞り込み
- タグページ(tags.html)で全タグを一覧表示
- ナビゲーションバーの「home」で全リンク表示に戻る

### タグの展開/折りたたみ
- タグが多い場合、自動的に1行に折りたたまれます
- 右側の「▼」ボタンをクリックして全タグを表示

## 🤝 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

[ISC License](https://opensource.org/licenses/ISC)

## 🙏 謝辞

- [discord.js](https://discord.js.org/) - Discord Bot開発フレームワーク
- [Puppeteer](https://pptr.dev/) - ヘッドレスブラウザ自動化
- [GitHub Actions](https://github.com/features/actions) - CI/CDプラットフォーム
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) - GitHub Pagesデプロイアクション

---

Made with ❤️ by [suginomoto](https://github.com/suginomoto)