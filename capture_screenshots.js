const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * スクリーンショットを取得する関数
 * @param {string} url - スクリーンショットを取得するURL
 * @param {string} outputPath - 保存先のパス
 * @returns {Promise<boolean>} - 成功したかどうか
 */
async function captureScreenshot(url, outputPath) {
    let browser;
    try {
        // ブラウザを起動
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // ビューポートを設定
        await page.setViewport({
            width: 1280,
            height: 720,
            deviceScaleFactor: 1,
        });

        // タイムアウトを設定してページを開く
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000, // 30秒
        });

        // 少し待機(JavaScriptの実行を待つ)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // スクリーンショットを取得
        await page.screenshot({
            path: outputPath,
            type: 'jpeg',
            quality: 80,
            fullPage: false, // ビューポート内のみ
        });

        await browser.close();
        return true;

    } catch (error) {
        console.error(`  エラー: ${error.message}`);
        if (browser) {
            await browser.close();
        }
        return false;
    }
}

/**
 * URLからファイル名を生成
 * @param {string} url - URL
 * @returns {string} - ファイル名
 */
function generateFilename(url) {
    // URLをハッシュ化してファイル名にする
    const hash = require('crypto')
        .createHash('md5')
        .update(url)
        .digest('hex');
    return `${hash}.jpg`;
}

/**
 * メイン処理
 */
async function main() {
    try {
        console.log('リンクデータを読み込み中...');

        const dataPath = path.join(__dirname, 'data', 'links.json');
        const screenshotsDir = path.join(__dirname, 'screenshots');

        if (!fs.existsSync(dataPath)) {
            console.error(`エラー: ${dataPath} が見つかりません`);
            console.error('先に fetch_links.js を実行してください');
            process.exit(1);
        }

        // screenshotsディレクトリを作成
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
            console.log(`${screenshotsDir} を作成しました`);
        }

        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const links = JSON.parse(jsonData);

        console.log(`${links.length} 件のリンクを処理中...\n`);

        // 各リンクのスクリーンショットを取得
        const linksWithScreenshots = [];
        let successCount = 0;
        let skipCount = 0;
        let failCount = 0;

        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const filename = generateFilename(link.url);
            const screenshotPath = path.join(screenshotsDir, filename);
            const relativeScreenshotPath = `screenshots/${filename}`;

            console.log(`[${i + 1}/${links.length}] ${link.url}`);

            // 既にスクリーンショットが存在する場合はスキップ
            if (fs.existsSync(screenshotPath)) {
                console.log(`  スキップ: スクリーンショットが既に存在します`);
                linksWithScreenshots.push({
                    ...link,
                    screenshot: relativeScreenshotPath,
                });
                skipCount++;
                continue;
            }

            // スクリーンショットを取得
            const success = await captureScreenshot(link.url, screenshotPath);

            if (success) {
                console.log(`  成功: ${relativeScreenshotPath}`);
                linksWithScreenshots.push({
                    ...link,
                    screenshot: relativeScreenshotPath,
                });
                successCount++;
            } else {
                console.log(`  失敗: スクリーンショットを取得できませんでした`);
                linksWithScreenshots.push({
                    ...link,
                    screenshot: null,
                });
                failCount++;
            }

            // レート制限を避けるため少し待機
            if (i < links.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // 更新されたデータを保存
        fs.writeFileSync(dataPath, JSON.stringify(linksWithScreenshots, null, 2), 'utf-8');

        console.log(`\nスクリーンショット取得完了!`);
        console.log(`成功: ${successCount} 件`);
        console.log(`スキップ: ${skipCount} 件`);
        console.log(`失敗: ${failCount} 件`);
        console.log(`データを ${dataPath} に保存しました`);

    } catch (error) {
        console.error('エラーが発生しました:', error);
        process.exit(1);
    }
}

// スクリプトを実行
main();
