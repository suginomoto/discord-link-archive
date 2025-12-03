const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 環境変数から認証情報とIDを読み込み
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const THREAD_ID = process.env.TARGET_THREAD_ID;

// 環境変数のチェック
if (!DISCORD_BOT_TOKEN) {
  console.error('エラー: DISCORD_BOT_TOKEN 環境変数が設定されていません');
  process.exit(1);
}

if (!THREAD_ID) {
  console.error('エラー: TARGET_THREAD_ID 環境変数が設定されていません');
  process.exit(1);
}

// Discordクライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// URLを抽出する正規表現
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * メッセージからURLを抽出する関数
 * @param {string} content - メッセージの内容
 * @returns {string[]} - 抽出されたURLの配列
 */
function extractUrls(content) {
  const urls = content.match(URL_REGEX);
  return urls || [];
}

/**
 * スレッドからすべてのメッセージを取得する関数
 * @param {ThreadChannel} thread - 対象のスレッド
 * @returns {Promise<Collection>} - メッセージのコレクション
 */
async function fetchAllMessages(thread) {
  const messages = [];
  let lastId;

  while (true) {
    const options = { limit: 100 };
    if (lastId) {
      options.before = lastId;
    }

    const batch = await thread.messages.fetch(options);
    messages.push(...batch.values());

    if (batch.size < 100) {
      break;
    }

    lastId = batch.last().id;
  }

  return messages;
}

/**
 * メッセージを整形してJSONオブジェクトに変換する関数
 * @param {Message} message - Discordメッセージオブジェクト
 * @returns {Object[]} - 整形されたリンク情報の配列
 */
function formatMessageData(message) {
  const urls = extractUrls(message.content);

  if (urls.length === 0) {
    return [];
  }

  return urls.map(url => ({
    url: url,
    author: {
      username: message.author.username,
      displayName: message.author.displayName || message.author.username,
      id: message.author.id,
      avatar: message.author.displayAvatarURL(),
    },
    timestamp: message.createdAt.toISOString(),
    messageId: message.id,
    content: message.content.substring(0, 200), // メッセージの最初の200文字を抜粋
    hasAttachments: message.attachments.size > 0,
    attachmentCount: message.attachments.size,
  }));
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('Discord Botにログイン中...');

    await client.login(DISCORD_BOT_TOKEN);

    console.log('ログイン成功！');
    console.log(`スレッド ID: ${THREAD_ID} からメッセージを取得中...`);

    // スレッドを取得
    const thread = await client.channels.fetch(THREAD_ID);

    if (!thread) {
      console.error('エラー: 指定されたスレッドが見つかりません');
      process.exit(1);
    }

    console.log(`スレッド名: ${thread.name}`);

    // すべてのメッセージを取得
    const messages = await fetchAllMessages(thread);
    console.log(`${messages.length} 件のメッセージを取得しました`);

    // URLを抽出して整形
    const links = [];
    for (const message of messages) {
      const formattedData = formatMessageData(message);
      links.push(...formattedData);
    }

    console.log(`${links.length} 件のURLを抽出しました`);

    // 新しい順にソート（タイムスタンプの降順）
    links.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // dataディレクトリを作成（存在しない場合）
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('dataディレクトリを作成しました');
    }

    // JSONファイルに保存
    const outputPath = path.join(dataDir, 'links.json');
    fs.writeFileSync(outputPath, JSON.stringify(links, null, 2), 'utf-8');

    console.log(`リンク情報を ${outputPath} に保存しました`);
    console.log('処理が完了しました！');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  } finally {
    // クライアントを終了
    client.destroy();
  }
}

// スクリプトを実行
main();
