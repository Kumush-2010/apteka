import TelegramBot from "node-telegram-bot-api";
import { BOT_TOKEN } from "../../config/config.js";
import { PrismaClient } from "@prisma/client";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const prisma = new PrismaClient();

export const start = async (msg) => {
  const chatId = msg.chat.id;
  const tgId = msg.from.id;

  try {
    const user = await prisma.user.findUnique({
      where: {
        telegramId: tgId,
      },
    });

    if (!user) {
      await bot.sendMessage(
        chatId,
        `Tilni tanlang:\nВыберите язык:\nPlease choose a language:`,
        {
          reply_markup: {
            keyboard: [
                ["O'zbekcha"],
                ["Русский"],
                ["English"],
            ],
            resize_keyboard: true,
            one_time_keyboard: true, 
          },
        }
      );
    } else {
      await bot.sendMessage(chatId, `Xush kelibsiz, ${user.name || 'foydalanuvchi'}!`);
    }
  } catch (error) {
    console.error("Xato:", error);
    await bot.sendMessage(chatId, "Botda ichki xatolik yuz berdi!");
  }
};


bot.on("polling_error", (error) => {
  console.error("Polling xatosi:", error);
});