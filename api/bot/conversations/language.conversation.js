 import prisma from "../../prisma/setup.js";
import messages from "../messages.js";
import { getMainKeyboard } from "./start.conversation.js";

export function registerLanguageConversation(bot) {
  const til = /^\/?(Til|Language|Язык)$/i;

  bot.onText(til, async (msg) => {
    const chatId = msg.chat.id;
    const langMessages = `
${messages.uz.choose_language}
${messages.ru.choose_language}
${messages.en.choose_language}
    `;
    await bot.sendMessage(chatId, langMessages.trim(), {
      reply_markup: {
        inline_keyboard: [
          [{ text: "O'zbekcha", callback_data: "lang_uz" }],
          [{ text: "Русский", callback_data: "lang_ru" }],
          [{ text: "English", callback_data: "lang_en" }],
        ],
      },
    });
  });

  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const telegramId = query.from.id.toString();
    const data = query.data;

    // Zarur: callback_query ga javob berish (spinnerni to‘xtatish)
    try {
      await bot.answerCallbackQuery(query.id);
    } catch (e) {
      console.warn("answerCallbackQuery xatosi:", e);
    }

    if (!data || !data.startsWith("lang_")) return;

    const lang = data.split("_")[1]; // uz, ru, en
    const languageNameMap = {
      uz: "O'zbekcha",
      ru: "Русский",
      en: "English",
    };
    const languageName = languageNameMap[lang] || "Tanlanmagan";

    try {
      // Tilni bazaga yozamiz (agar yo‘q bo‘lsa — yaratish)
      await prisma.user.upsert({
        where: { telegramId },
        update: { language: lang },
        create: { telegramId, language: lang },
      });

      // Til o‘zgargani haqidagi xabar matni
      const langMessageText = languageMessage(lang);

      // Xabarni tahrirlash (til o‘zgardi degan xabar bilan)
      await bot.editMessageText(langMessageText, {
        chat_id: chatId,
        message_id: query.message.message_id,
      });

      // Asosiy keyboard tilga mos ravishda yuborish
      const mainKeyboard = await getMainKeyboard(lang);
      await bot.sendMessage(
        chatId,
        languageName + " " + "tili tanlandi.", // yoki moslashtirilgan xabar
        {
          reply_markup: {
            keyboard: mainKeyboard,
            resize_keyboard: true,
          },
        }
      );
    } catch (error) {
      console.error("Prisma yoki xabar yuborishda xato:", error);
      await bot.sendMessage(
        chatId,
        "Xatolik yuz berdi, iltimos keyinroq urinib ko‘ring."
      );
    }
  });
}

function languageMessage(langCode) {
  const messagesByCode = {
    uz: "Til muvaffaqiyatli o'zgartirildi.",
    ru: "Язык успешно изменен.",
    en: "Language successfully changed.",
  };
  return messagesByCode[langCode] || "Til tanladi.";
}
