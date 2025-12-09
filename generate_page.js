const fs = require('fs');
const path = require('path');

/**
 * 日付を読みやすい形式にフォーマットする関数
 * @param {string} isoString - ISO 8601形式の日付文字列
 * @returns {string} - フォーマットされた日付文字列
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * URLからドメイン名を抽出する関数
 * @param {string} url - URL文字列
 * @returns {string} - ドメイン名
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return 'unknown';
  }
}

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
 * ユニークな投稿者数を取得する関数
 * @param {Object[]} links - リンク情報の配列
 * @returns {number} - ユニークな投稿者数
 */
function getUniqueAuthorsCount(links) {
  const uniqueAuthors = new Set(links.map(link => link.author.id));
  return uniqueAuthors.size;
}

/**
 * 全タグを取得する関数
 * @param {Object[]} links - リンク情報の配列
 * @returns {string[]} - ユニークなタグの配列
 */
function getAllTags(links) {
  const allTags = links.flatMap(link => link.tags || []);
  return [...new Set(allTags)].sort();
}

/**
 * ユニークなドメイン数を取得する関数
 * @param {Object[]} links - リンク情報の配列
 * @returns {number} - ユニークなドメイン数
 */
function getUniqueDomainsCount(links) {
  const uniqueDomains = new Set(links.map(link => extractDomain(link.url)));
  return uniqueDomains.size;
}

/**
 * HTMLテンプレートを生成する関数
 * @param {Object[]} links - リンク情報の配列
 * @returns {string} - 完全なHTML文字列
 */
function generateHTML(links) {
  const allTags = getAllTags(links);

  const linkItems = links.map((link, index) => `
    <li class="link-item" data-tags="${(link.tags || []).join(',')}">
      <div class="link-header">
        <div class="author-info">
          <img src="${link.author.avatar}" alt="${link.author.displayName}" class="avatar">
          <span class="author-name">${link.author.displayName}</span>
        </div>
        <span class="timestamp">${formatDate(link.timestamp)}</span>
      </div>
      ${link.tags && link.tags.length > 0 ? `
      <div class="tags">
        ${link.tags.map(tag => `<span class="tag" data-tag="${tag}">#${tag}</span>`).join('')}
      </div>
      ` : ''}
      <div class="link-content">
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-url" title="${link.url}">
          ${link.title || link.url}
        </a>
        <span class="domain">${extractDomain(link.url)}</span>
      </div>
      ${link.descriptionJa ? `<div class="description">${escapeHtml(link.descriptionJa)}</div>` : ''}
      ${link.content ? `<div class="message-excerpt">${escapeHtml(link.content)}</div>` : ''}
      ${link.screenshot ? `
      <details class="screenshot-container">
        <summary class="screenshot-toggle">スクリーンショットを表示</summary>
        <img src="${link.screenshot}" alt="Screenshot of ${link.url}" class="screenshot" loading="lazy">
      </details>
      ` : ''}
      ${link.hasAttachments ? `<div class="attachments-badge">📎 ${link.attachmentCount} 個の添付ファイル</div>` : ''}
    </li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discord Link Archive</title>
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
      --tag-bg: rgba(74, 158, 255, 0.15);
      --tag-border: rgba(74, 158, 255, 0.3);
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
      max-width: 100%;
      margin: 0;
    }

    header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 1rem;
      background: var(--bg-card);
      border-radius: 0;
      box-shadow: var(--shadow);
      border: none;
      border-bottom: 1px solid var(--border-color);
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
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-primary);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .filter-section {
      margin-bottom: 2rem;
      padding: 1.5rem 1rem;
      background: var(--bg-card);
      border-radius: 0;
      border: none;
      border-bottom: 1px solid var(--border-color);
    }

    .filter-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .filter-tag {
      padding: 0.5rem 1rem;
      background: var(--tag-bg);
      border: 1px solid var(--tag-border);
      border-radius: 6px;
      color: var(--accent-primary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .filter-tag:hover {
      background: rgba(74, 158, 255, 0.25);
      border-color: var(--accent-primary);
    }

    .filter-tag.active {
      background: var(--accent-primary);
      color: var(--bg-primary);
      border-color: var(--accent-primary);
    }

    .clear-filter {
      padding: 0.5rem 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .clear-filter:hover {
      background: var(--border-color);
      color: var(--text-primary);
    }

    .links-list {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      padding: 0 1rem;
    }

    .link-item {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .link-item.hidden {
      display: none;
    }

    .link-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.3);
      border-color: var(--accent-primary);
    }

    .link-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--accent-primary);
    }

    .author-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .timestamp {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-bottom: 0.75rem;
    }

    .tag {
      padding: 0.2rem 0.5rem;
      background: var(--tag-bg);
      border: 1px solid var(--tag-border);
      border-radius: 4px;
      color: var(--accent-primary);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tag:hover {
      background: rgba(74, 158, 255, 0.25);
      border-color: var(--accent-primary);
    }

    .link-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      flex: 1;
    }

    .link-url {
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 500;
      word-break: break-word;
      transition: color 0.2s ease;
      font-size: 0.9rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .link-url:hover {
      color: var(--accent-secondary);
      text-decoration: underline;
    }

    .domain {
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      width: fit-content;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }


    .description {
      color: var(--text-secondary);
      font-size: 0.75rem;
      line-height: 1.4;
      margin-top: 0.5rem;
      font-style: italic;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .message-excerpt {
      color: var(--text-secondary);
      font-size: 0.75rem;
      line-height: 1.4;
      padding: 0.5rem;
      background: var(--bg-secondary);
      border-radius: 6px;
      border-left: 2px solid var(--accent-primary);
      margin-top: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .screenshot-container {
      margin-top: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .screenshot-toggle {
      padding: 0.75rem 1rem;
      background: var(--bg-secondary);
      cursor: pointer;
      user-select: none;
      font-size: 0.875rem;
      color: var(--text-secondary);
      transition: all 0.2s ease;
    }

    .screenshot-toggle:hover {
      background: var(--border-color);
      color: var(--text-primary);
    }

    .screenshot {
      width: 100%;
      display: block;
      border-top: 1px solid var(--border-color);
    }

    .attachments-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--accent-secondary);
      background: rgba(123, 104, 238, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      width: fit-content;
      margin-top: 0.5rem;
    }

    footer {
      text-align: center;
      margin-top: 3rem;
      padding: 2rem 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    @media (max-width: 1400px) {
      .links-list {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .links-list {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      body {
        padding: 1rem 0;
      }

      h1 {
        font-size: 2rem;
      }

      .links-list {
        grid-template-columns: 1fr;
        padding: 0 0.5rem;
      }

      .link-item {
        padding: 1rem;
      }

      .stats {
        gap: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Discord Link Archive</h1>
      <p class="subtitle">スレッドで共有されたリンク集</p>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">${links.length}</div>
          <div class="stat-label">リンク数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${getUniqueAuthorsCount(links)}</div>
          <div class="stat-label">投稿者数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${allTags.length}</div>
          <div class="stat-label">タグ数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${getUniqueDomainsCount(links)}</div>
          <div class="stat-label">ドメイン数</div>
        </div>
      </div>
    </header>

    ${allTags.length > 0 ? `
    <div class="filter-section">
      <div class="filter-title">タグでフィルター</div>
      <div class="filter-tags">
        <span class="clear-filter" onclick="clearFilter()">すべて表示</span>
        ${allTags.map(tag => `<span class="filter-tag" onclick="filterByTag('${tag}')">#${tag}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    <ul class="links-list" id="linksList">
      ${linkItems}
    </ul>

    <footer>
      <p>最終更新: ${new Date().toLocaleString('ja-JP')}</p>
      <p>Generated by Discord Link Archive</p>
    </footer>
  </div>

  <script>
    let activeFilter = null;

    function filterByTag(tag) {
      activeFilter = tag;
      const linkItems = document.querySelectorAll('.link-item');
      const filterTags = document.querySelectorAll('.filter-tag');

      // フィルタータグのアクティブ状態を更新
      filterTags.forEach(filterTag => {
        if (filterTag.textContent === '#' + tag) {
          filterTag.classList.add('active');
        } else {
          filterTag.classList.remove('active');
        }
      });

      // リンクアイテムをフィルタリング
      linkItems.forEach(item => {
        const tags = item.dataset.tags.split(',');
        if (tags.includes(tag)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });

      // タグクリックでもフィルタリング
      document.querySelectorAll('.tag').forEach(tagElement => {
        tagElement.onclick = function() {
          const clickedTag = this.dataset.tag;
          filterByTag(clickedTag);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
      });
    }

    function clearFilter() {
      activeFilter = null;
      const linkItems = document.querySelectorAll('.link-item');
      const filterTags = document.querySelectorAll('.filter-tag');

      // すべてのフィルタータグの選択を解除
      filterTags.forEach(filterTag => {
        filterTag.classList.remove('active');
      });

      // すべてのリンクアイテムを表示
      linkItems.forEach(item => {
        item.classList.remove('hidden');
      });
    }

    // ページ読み込み時にタグクリックイベントを設定
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.tag').forEach(tagElement => {
        tagElement.onclick = function() {
          const clickedTag = this.dataset.tag;
          filterByTag(clickedTag);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
      });
    });
  </script>
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

    // HTMLを生成
    console.log('HTMLページを生成中...');
    const html = generateHTML(links);

    // index.htmlに書き出し
    const outputPath = path.join(__dirname, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf-8');

    console.log(`HTMLページを ${outputPath} に保存しました`);
    console.log('処理が完了しました!');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトを実行
main();
