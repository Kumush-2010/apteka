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
        bot.sendMessage(chatId, langMessages.trim(), {
            reply_markup: {
                inline_keyboard: [
                        [{ text: 'O\'zbekcha', callback_data: 'lang_uz' }],
                        [{ text: 'Русский', callback_data: 'lang_ru' }],
                        [{ text: 'English', callback_data: 'lang_en' }]
                    
                ]
            }
        });
    });

 bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    console.log("Til tanlash:", chatId);
    const telegramId = query.from.id.toString();
    const data = query.data;

    if (!data.startsWith('lang_')) return;

    const lang = data.split('_')[1];
    const languageName = {
        uz: "O'zbekcha",
        ru: 'Русский',
        en: 'English'
    }[lang] || 'Tanlanmagan';

    try {
        // 📦 Tilni bazaga yozamiz
        await prisma.user.update({
            where: { telegramId },
            data: { language: lang }
        });

        const langMessage = await languageMessage(languageName)
        // ✅ Foydalanuvchiga til o‘zgargani haqida habar + yangi menyu
        await bot.editMessageText(langMessage, {
            chat_id: chatId,
            message_id: query.message.message_id,
        });

        // 🧩 Keyboard tilga qarab yangilanadi
        const mainKeyboard = await getMainKeyboard(lang);
        await bot.sendMessage(chatId, {
            reply_markup: {
                keyboard: mainKeyboard,
                resize_keyboard: true,
            }
        });

    } catch (error) {
        console.error("Prisma update error:", error);
        console.log("Tilni yangilashda xatolik:", chatId);
        await bot.sendMessage(chatId, "Xatolik yuz berdi, iltimos keyinroq urinib ko‘ring.");
    }
});
}

function languageMessage(lang) {
    return {
        uz: "Til muvaffaqiyatli o'zgartirildi.",
        ru: "Язык успешно изменен.",
        en: "Language successfully changed."
    }
}