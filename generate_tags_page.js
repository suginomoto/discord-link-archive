const fs = require('fs');
const path = require('path');

/**
 * HTMLエスケープ関数
 * @param {string} text - エスケープする文字列
 * @returns {string} - エスケープされた文字列
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * タグ情報を集計する関数
 * @param {Object[]} links - リンク情報の配列
 * @returns {Object[]} - タグ情報の配列（タグ名、使用回数）
 */
function aggregateTags(links) {
  const tagMap = new Map();

  links.forEach(link => {
    if (link.tags && link.tags.length > 0) {
      link.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, { name: tag, count: 0 });
        }
        tagMap.get(tag).count++;
      });
    }
  });

  // カウント順にソート
  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * タグページのHTMLを生成する関数
 * @param {Object[]} tagData - タグ情報の配列
 * @returns {string} - 完全なHTML文字列
 */
function generateTagsHTML(tagData) {
  const tagItems = tagData.map(tag => `
    <a href="index.html?tag=${encodeURIComponent(tag.name)}" class="tag-item-link">
      <div class="tag-item">
        <span class="tag-name">#${escapeHtml(tag.name)}</span>
        <span class="tag-count">${tag.count}</span>
      </div>
    </a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tags - Discord Link Archive</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg-primary: #0f0f23;
      --bg-secondary: #1a1a2e;
      --bg-card: #16213e;
      --accent-primary: #4a9eff;
      --accent-secondary: #7b68ee;
      --text-primary: #e4e4e7;
      --text-secondary: #a1a1aa;
      --border-color: #27272a;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      color: var(--text-primary);
      min-height: 100vh;
      padding: 2rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 1rem;
      background: var(--bg-card);
      border-radius: 12px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      position: relative;
    }

    .back-link {
      position: absolute;
      top: 1rem;
      left: 1rem;
      padding: 0.5rem 1rem;
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-block;
    }

    .back-link:hover {
      background: var(--border-color);
      transform: translateY(-2px);
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .stats {
      margin-top: 1.5rem;
      color: var(--accent-primary);
      font-size: 1.2rem;
      font-weight: 600;
    }

    .tags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .tag-item-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .tag-item {
      background: var(--bg-card);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    .tag-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.3);
      border-color: var(--accent-primary);
    }

    .tag-name {
      font-size: 1rem;
      color: var(--accent-primary);
      font-weight: 600;
    }

    .tag-count {
      font-size: 0.875rem;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-weight: 600;
    }

    footer {
      text-align: center;
      margin-top: 3rem;
      padding: 2rem 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .tags-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="index.html" class="back-link">← 戻る</a>
      <h1>Tags</h1>
      <p class="subtitle">タグ一覧</p>
      <div class="stats">${tagData.length} タグ</div>
    </header>

    <div class="tags-grid">
      ${tagItems}
    </div>

    <footer>
      <p>最終更新: ${new Date().toLocaleString('ja-JP')}</p>
      <p>Generated by Discord Link Archive</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('リンクデータを読み込み中...');

    // links.jsonを読み込み
    const dataPath = path.join(__dirname, 'data', 'links.json');

    if (!fs.existsSync(dataPath)) {
      console.error(`エラー: ${dataPath} が見つかりません`);
      console.error('先に fetch_links.js を実行してください');
      process.exit(1);
    }

    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const links = JSON.parse(jsonData);

    console.log(`${links.length} 件のリンクを読み込みました`);

    // タグ情報を集計
    console.log('タグ情報を集計中...');
    const tagData = aggregateTags(links);
    console.log(`${tagData.length} 個のタグを検出しました`);

    // HTMLを生成
    console.log('タグページを生成中...');
    const html = generateTagsHTML(tagData);

    // tags.htmlに書き出し
    const outputPath = path.join(__dirname, 'tags.html');
    fs.writeFileSync(outputPath, html, 'utf-8');

    console.log(`タグページを ${outputPath} に保存しました`);
    console.log('処理が完了しました!');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみmainを実行
if (require.main === module) {
  main();
}

module.exports = { aggregateTags, generateTagsHTML };
