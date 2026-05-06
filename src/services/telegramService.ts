import axios from "axios";
import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const TELEGRAM_MESSAGE_LIMIT = 3900;

export async function sendTelegramMessage(message: string) {
  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configurado.");
  }

  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

export async function sendLongTelegramMessage(message: string) {
  const chunks = splitMessage(message, TELEGRAM_MESSAGE_LIMIT);

  for (const chunk of chunks) {
    await sendTelegramMessage(chunk);
    await wait(400);
  }
}

function splitMessage(message: string, limit: number) {
  const parts = message.split("\n\n");
  const chunks: string[] = [];

  let currentChunk = "";

  for (const part of parts) {
    const nextChunk = currentChunk ? `${currentChunk}\n\n${part}` : part;

    if (nextChunk.length > limit) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }

      currentChunk = part;
    } else {
      currentChunk = nextChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
