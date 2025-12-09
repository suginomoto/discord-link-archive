const fs = require('fs');
const path = require('path');

/**
 * URLからドメイン名を抽出してタグ化
 * @param {string} url - URL文字列
 * @returns {string[]} - タグの配列
 */
function generateDomainTags(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const tags = [];

        // ドメインマッピング
        const domainMap = {
            'github.com': 'GitHub',
            'stackoverflow.com': 'StackOverflow',
            'reddit.com': 'Reddit',
            'twitter.com': 'Twitter',
            'x.com': 'Twitter',
            'youtube.com': 'YouTube',
            'youtu.be': 'YouTube',
            'medium.com': 'Medium',
            'dev.to': 'DevTo',
            'qiita.com': 'Qiita',
            'zenn.dev': 'Zenn',
            'note.com': 'Note',
            'amazon.co.jp': 'Amazon',
            'amazon.com': 'Amazon',
            'wikipedia.org': 'Wikipedia',
            'docs.google.com': 'GoogleDocs',
            'drive.google.com': 'GoogleDrive',
            'notion.so': 'Notion',
            'figma.com': 'Figma',
            'canva.com': 'Canva',
            'discord.com': 'Discord',
            'slack.com': 'Slack',
            'trello.com': 'Trello',
            'asana.com': 'Asana',
            'linkedin.com': 'LinkedIn',
            'facebook.com': 'Facebook',
            'instagram.com': 'Instagram',
            'tiktok.com': 'TikTok',
            'twitch.tv': 'Twitch',
            'spotify.com': 'Spotify',
            'soundcloud.com': 'SoundCloud',
            'npmjs.com': 'npm',
            'pypi.org': 'PyPI',
            'docker.com': 'Docker',
            'kubernetes.io': 'Kubernetes',
            'aws.amazon.com': 'AWS',
            'cloud.google.com': 'GCP',
            'azure.microsoft.com': 'Azure',
        };

        // 完全一致チェック
        if (domainMap[hostname]) {
            tags.push(domainMap[hostname]);
        } else {
            // 部分一致チェック
            for (const [domain, tag] of Object.entries(domainMap)) {
                if (hostname.includes(domain)) {
                    tags.push(tag);
                    break;
                }
            }
        }

        return tags;
    } catch (error) {
        return [];
    }
}

/**
 * URLパスからタグを抽出
 * @param {string} url - URL文字列
 * @returns {string[]} - タグの配列
 */
function generatePathTags(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        const tags = [];

        // キーワードマッピング (日本語タグ)
        const keywordMap = {
            'linux': 'Linux',
            'windows': 'Windows',
            'macos': 'macOS',
            'ios': 'iOS',
            'android': 'Android',
            'python': 'Python',
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'java': 'Java',
            'cpp': 'C++',
            'csharp': 'C#',
            'ruby': 'Ruby',
            'php': 'PHP',
            'go': 'Go',
            'rust': 'Rust',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'react': 'React',
            'vue': 'Vue',
            'angular': 'Angular',
            'nodejs': 'Node.js',
            'node': 'Node.js',
            'docker': 'Docker',
            'kubernetes': 'Kubernetes',
            'aws': 'AWS',
            'gcp': 'GCP',
            'azure': 'Azure',
            'ai': 'AI',
            'ml': '機械学習',
            'machine-learning': '機械学習',
            'deep-learning': 'ディープラーニング',
            'data-science': 'データサイエンス',
            'frontend': 'フロントエンド',
            'backend': 'バックエンド',
            'fullstack': 'フルスタック',
            'devops': 'DevOps',
            'security': 'セキュリティ',
            'database': 'データベース',
            'sql': 'SQL',
            'nosql': 'NoSQL',
            'api': 'API',
            'rest': 'REST',
            'graphql': 'GraphQL',
            'tutorial': 'チュートリアル',
            'guide': 'ガイド',
            'documentation': 'ドキュメント',
            'blog': 'ブログ',
            'news': 'ニュース',
            'article': '記事',
            'video': '動画',
            'podcast': 'ポッドキャスト',
            'tool': 'ツール',
            'editor': 'エディタ',
            'vscode': 'VSCode',
            'vim': 'Vim',
            'emacs': 'Emacs',
            'git': 'Git',
            'github': 'GitHub',
            'gitlab': 'GitLab',
            'design': 'デザイン',
            'ui': 'UI',
            'ux': 'UX',
            'css': 'CSS',
            'html': 'HTML',
            'sass': 'Sass',
            'tailwind': 'TailwindCSS',
            'bootstrap': 'Bootstrap',
        };

        // パスとクエリパラメータからキーワードを検索
        const fullPath = pathname + urlObj.search;
        for (const [keyword, tag] of Object.entries(keywordMap)) {
            if (fullPath.includes(keyword)) {
                tags.push(tag);
            }
        }

        return tags;
    } catch (error) {
        return [];
    }
}

/**
 * メッセージ内容からタグを抽出
 * @param {string} content - メッセージ内容
 * @returns {string[]} - タグの配列
 */
function generateContentTags(content) {
    if (!content) return [];

    const tags = [];
    const lowerContent = content.toLowerCase();

    // キーワードマッピング(メッセージ用・日本語タグ)
    const keywordMap = {
        'linux': 'Linux',
        'windows': 'Windows',
        'mac': 'macOS',
        'python': 'Python',
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'react': 'React',
        'vue': 'Vue',
        'angular': 'Angular',
        'docker': 'Docker',
        'kubernetes': 'Kubernetes',
        'ai': 'AI',
        '機械学習': '機械学習',
        'チュートリアル': 'チュートリアル',
        'ガイド': 'ガイド',
        'ツール': 'ツール',
        'エディタ': 'エディタ',
        'デザイン': 'デザイン',
        'セキュリティ': 'セキュリティ',
        'データベース': 'データベース',
        'フロントエンド': 'フロントエンド',
        'バックエンド': 'バックエンド',
    };

    for (const [keyword, tag] of Object.entries(keywordMap)) {
        if (lowerContent.includes(keyword)) {
            tags.push(tag);
        }
    }

    return tags;
}

/**
 * タグを正規化(重複削除、ソート)
 * @param {string[]} tags - タグの配列
 * @returns {string[]} - 正規化されたタグの配列
 */
function normalizeTags(tags) {
    // 重複削除とソート
    return [...new Set(tags)].sort();
}

/**
 * メイン処理
 */
async function main() {
    try {
        console.log('リンクデータを読み込み中...');

        const dataPath = path.join(__dirname, 'data', 'links.json');

        if (!fs.existsSync(dataPath)) {
            console.error(`エラー: ${dataPath} が見つかりません`);
            console.error('先に fetch_links.js を実行してください');
            process.exit(1);
        }

        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const links = JSON.parse(jsonData);

        console.log(`${links.length} 件のリンクを処理中...`);

        // 各リンクにタグを生成
        const linksWithTags = links.map((link, index) => {
            const tags = [];

            // メタデータから生成されたタグを追加 (fetch_metadata.jsで生成)
            if (link.metaTags && link.metaTags.length > 0) {
                tags.push(...link.metaTags);
            }

            // ドメインからタグ生成
            tags.push(...generateDomainTags(link.url));

            // URLパスからタグ生成
            tags.push(...generatePathTags(link.url));

            // メッセージ内容からタグ生成
            tags.push(...generateContentTags(link.content));

            // タグを正規化
            const normalizedTags = normalizeTags(tags);

            console.log(`[${index + 1}/${links.length}] ${link.url} -> タグ: ${normalizedTags.join(', ') || 'なし'}`);

            return {
                ...link,
                tags: normalizedTags,
            };
        });

        // 更新されたデータを保存
        fs.writeFileSync(dataPath, JSON.stringify(linksWithTags, null, 2), 'utf-8');

        console.log(`タグ生成完了! ${dataPath} に保存しました`);

        // 統計情報を表示
        const allTags = linksWithTags.flatMap(link => link.tags);
        const uniqueTags = [...new Set(allTags)];
        console.log(`\n生成されたユニークなタグ数: ${uniqueTags.size}`);
        console.log(`タグ一覧: ${uniqueTags.join(', ')}`);

    } catch (error) {
        console.error('エラーが発生しました:', error);
        process.exit(1);
    }
}

// スクリプトを実行
main();
