const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { translate } = require('@vitalets/google-translate-api');
const { URL } = require('url');

/**
 * 相対URLを絶対URLに変換する関数
 * @param {string} imageUrl - 画像URL
 * @param {string} baseUrl - ベースURL
 * @returns {string} - 絶対URL
 */
function resolveImageUrl(imageUrl, baseUrl) {
    try {
        // 既に絶対URLの場合はそのまま返す
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        // プロトコル相対URLの場合
        if (imageUrl.startsWith('//')) {
            const baseUrlObj = new URL(baseUrl);
            return `${baseUrlObj.protocol}${imageUrl}`;
        }

        // 相対URLの場合
        const baseUrlObj = new URL(baseUrl);
        return new URL(imageUrl, baseUrlObj.origin).href;
    } catch (error) {
        console.log(`  ⚠ URL解決失敗: ${imageUrl}`);
        return imageUrl;
    }
}

/**
 * GitHubリポジトリのURLかどうかを判定する関数
 * @param {string} url - 対象のURL
 * @returns {boolean} - GitHubリポジトリの場合true
 */
function isGitHubRepo(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'github.com' && urlObj.pathname.split('/').filter(p => p).length >= 2;
    } catch (error) {
        return false;
    }
}

/**
 * GitHubリポジトリのREADMEから画像を取得する関数
 * @param {string} repoUrl - GitHubリポジトリのURL
 * @returns {Promise<string>} - 画像URL
 */
async function fetchGitHubReadmeImage(repoUrl) {
    try {
        const urlObj = new URL(repoUrl);
        const pathParts = urlObj.pathname.split('/').filter(p => p);

        if (pathParts.length < 2) {
            return '';
        }

        const owner = pathParts[0];
        const repo = pathParts[1];

        // GitHub APIを使用してREADMEを取得
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw',
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 5000
        });

        const readmeContent = response.data;

        // Markdown形式の画像を抽出 (![alt](url) 形式)
        const imageRegex = /!\[.*?\]\((.*?)\)/;
        const match = readmeContent.match(imageRegex);

        if (match && match[1]) {
            let imageUrl = match[1];

            // 相対パスの場合は絶対URLに変換
            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${imageUrl}`;
            }

            console.log(`  ✓ GitHub README画像を取得: ${imageUrl.substring(0, 60)}...`);
            return imageUrl;
        }

        return '';
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log(`  ⚠ README not found`);
        } else {
            console.log(`  ⚠ GitHub画像取得失敗: ${error.message}`);
        }
        return '';
    }
}

/**
 * URLからメタデータを取得する関数
 * @param {string} url - 対象のURL
 * @returns {Promise<Object>} - メタデータオブジェクト
 */
async function fetchMetadata(url) {
    const metadata = {
        title: url, // フォールバック: URLをタイトルとして使用
        description: '',
        metaTags: [],
        image: '' // 画像URL
    };

    try {
        console.log(`  メタデータ取得中: ${url}`);

        // HTTPリクエストを送信 (タイムアウト5秒)
        const response = await axios.get(url, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            maxRedirects: 5
        });

        // HTMLをパース
        const $ = cheerio.load(response.data);

        // 1. タイトルの取得 (優先順位: OGP > Twitter Card > title タグ)
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const twitterTitle = $('meta[name="twitter:title"]').attr('content');
        const htmlTitle = $('title').text();

        metadata.title = ogTitle || twitterTitle || htmlTitle || url;
        metadata.title = metadata.title.trim();

        // 2. 説明文の取得
        const ogDescription = $('meta[property="og:description"]').attr('content');
        const twitterDescription = $('meta[name="twitter:description"]').attr('content');
        const metaDescription = $('meta[name="description"]').attr('content');

        metadata.description = ogDescription || twitterDescription || metaDescription || '';
        metadata.description = metadata.description.trim();

        // 3. キーワードの取得
        const keywords = $('meta[name="keywords"]').attr('content');
        if (keywords) {
            metadata.metaTags = keywords.split(',').map(k => k.trim()).filter(k => k);
        }

        // 4. 画像の取得 (優先順位: OGP > Twitter Card)
        const ogImage = $('meta[property="og:image"]').attr('content');
        const twitterImage = $('meta[name="twitter:image"]').attr('content');
        let imageUrl = ogImage || twitterImage || '';

        // 相対URLを絶対URLに変換
        if (imageUrl) {
            imageUrl = resolveImageUrl(imageUrl, url);
            metadata.image = imageUrl;
        }

        // 5. GitHubリポジトリの場合、READMEから画像を取得
        if (!metadata.image && isGitHubRepo(url)) {
            const readmeImage = await fetchGitHubReadmeImage(url);
            if (readmeImage) {
                metadata.image = readmeImage;
            }
        }

        console.log(`  ✓ タイトル: ${metadata.title.substring(0, 50)}${metadata.title.length > 50 ? '...' : ''}`);
        if (metadata.image) {
            console.log(`  ✓ 画像: ${metadata.image.substring(0, 60)}${metadata.image.length > 60 ? '...' : ''}`);
        }

    } catch (error) {
        // エラー時はデフォルト値を使用
        if (error.code === 'ECONNABORTED') {
            console.log(`  ⚠ タイムアウト: ${url}`);
        } else if (error.response) {
            console.log(`  ⚠ HTTPエラー (${error.response.status}): ${url}`);
        } else {
            console.log(`  ⚠ 取得失敗: ${url} - ${error.message}`);
        }
    }

    return metadata;
}

/**
 * テキストを日本語に翻訳する関数
 * @param {string} text - 翻訳するテキスト
 * @returns {Promise<string>} - 翻訳されたテキスト
 */
async function translateToJapanese(text) {
    if (!text || text.trim() === '') {
        return '';
    }

    // 既に日本語が含まれている場合はそのまま返す
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    if (japaneseRegex.test(text)) {
        return text;
    }

    try {
        const result = await translate(text, { to: 'ja' });
        return result.text;
    } catch (error) {
        console.log(`  ⚠ 翻訳失敗: ${error.message}`);
        return text; // 翻訳失敗時は元のテキストを返す
    }
}

/**
 * メタデータからタグを生成する関数
 * @param {Object} metadata - メタデータオブジェクト
 * @param {string} url - URL
 * @returns {string[]} - 生成されたタグの配列
 */
function generateTagsFromMetadata(metadata, url) {
    const tags = new Set();

    // 結合テキスト (タイトル + 説明文 + URL)
    const combinedText = (metadata.title + ' ' + metadata.description + ' ' + url).toLowerCase();

    // キーワードマッピング (日本語タグ)
    const keywordMap = {
        // プログラミング言語
        'python': 'Python',
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'java': 'Java',
        'c++': 'C++',
        'c#': 'C#',
        'ruby': 'Ruby',
        'php': 'PHP',
        'go': 'Go',
        'golang': 'Go',
        'rust': 'Rust',
        'swift': 'Swift',
        'kotlin': 'Kotlin',

        // フレームワーク・ライブラリ
        'react': 'React',
        'vue': 'Vue',
        'angular': 'Angular',
        'nodejs': 'Node.js',
        'node.js': 'Node.js',
        'django': 'Django',
        'flask': 'Flask',
        'spring': 'Spring',
        'laravel': 'Laravel',
        'rails': 'Rails',

        // プラットフォーム
        'github': 'GitHub',
        'gitlab': 'GitLab',
        'docker': 'Docker',
        'kubernetes': 'Kubernetes',
        'aws': 'AWS',
        'azure': 'Azure',
        'gcp': 'GCP',
        'google cloud': 'GCP',

        // 技術カテゴリ (日本語)
        'ai': 'AI',
        'artificial intelligence': 'AI',
        'machine learning': '機械学習',
        'deep learning': 'ディープラーニング',
        'data science': 'データサイエンス',
        'frontend': 'フロントエンド',
        'backend': 'バックエンド',
        'fullstack': 'フルスタック',
        'devops': 'DevOps',
        'security': 'セキュリティ',
        'database': 'データベース',
        'web development': 'Web開発',
        'mobile': 'モバイル',
        'design': 'デザイン',
        'ui': 'UI',
        'ux': 'UX',

        // コンテンツタイプ (日本語)
        'tutorial': 'チュートリアル',
        'guide': 'ガイド',
        'documentation': 'ドキュメント',
        'blog': 'ブログ',
        'article': '記事',
        'video': '動画',
        'course': '講座',
        'tool': 'ツール',
        'library': 'ライブラリ',
        'framework': 'フレームワーク',

        // 日本語キーワード
        'チュートリアル': 'チュートリアル',
        'ガイド': 'ガイド',
        'ドキュメント': 'ドキュメント',
        'ブログ': 'ブログ',
        '記事': '記事',
        '機械学習': '機械学習',
        'ディープラーニング': 'ディープラーニング',
        'データサイエンス': 'データサイエンス',
        'フロントエンド': 'フロントエンド',
        'バックエンド': 'バックエンド',
        'セキュリティ': 'セキュリティ',
        'データベース': 'データベース',
        'ツール': 'ツール',
        'デザイン': 'デザイン',
    };

    // キーワードマッチング
    for (const [keyword, tag] of Object.entries(keywordMap)) {
        if (combinedText.includes(keyword.toLowerCase())) {
            tags.add(tag);
        }
    }

    // メタタグからもタグを追加
    if (metadata.metaTags && metadata.metaTags.length > 0) {
        metadata.metaTags.forEach(tag => {
            const normalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
            if (normalizedTag.length > 2 && normalizedTag.length < 20) {
                tags.add(normalizedTag);
            }
        });
    }

    return Array.from(tags);
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

        console.log(`${links.length} 件のリンクを処理中...\n`);

        // 各リンクのメタデータを取得
        const enrichedLinks = [];
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            console.log(`[${i + 1}/${links.length}] ${link.url}`);

            // メタデータを取得
            const metadata = await fetchMetadata(link.url);

            // 説明文を日本語に翻訳
            let descriptionJa = '';
            if (metadata.description) {
                console.log(`  翻訳中...`);
                descriptionJa = await translateToJapanese(metadata.description);
            }

            // メタデータからタグを生成
            const metaTags = generateTagsFromMetadata(metadata, link.url);

            // リンクデータにメタデータを追加
            enrichedLinks.push({
                ...link,
                title: metadata.title,
                description: metadata.description, // 元の説明文
                descriptionJa: descriptionJa,      // 日本語の説明文
                metaTags: metaTags,
                image: metadata.image || ''       // 画像URL
            });

            // レート制限を避けるため、少し待機
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 更新されたデータを保存
        fs.writeFileSync(dataPath, JSON.stringify(enrichedLinks, null, 2), 'utf-8');

        console.log(`\nメタデータ取得完了! ${dataPath} に保存しました`);
        console.log(`タイトルが取得されたリンク: ${enrichedLinks.filter(l => l.title !== l.url).length}/${enrichedLinks.length}`);

    } catch (error) {
        console.error('エラーが発生しました:', error);
        process.exit(1);
    }
}

// スクリプトを実行
main();
