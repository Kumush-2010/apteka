import prisma from "../../prisma/setup.js";
import { getMainKeyboard } from "./start.conversation.js";

export function registerLanguageConversation(bot) {
   const til = /^\/?(Til|Language|Язык)$/i;

    bot.onText(til, async (msg) => {
        const chatId = msg.chat.id;

        bot.sendMessage(chatId, "Tilni tanlang:", {
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

        // ✅ Foydalanuvchiga til o‘zgargani haqida habar + yangi menyu
        await bot.editMessageText(`Til muvaffaqiyatli o'zgartirildi: ${languageName}`, {
            chat_id: chatId,
            message_id: query.message.message_id,
        });

        // 🧩 Keyboard tilga qarab yangilanadi
        const mainKeyboard = getMainKeyboard(lang);
        await bot.sendMessage(chatId, "Asosiy menyu:", {
            reply_markup: {
                keyboard: mainKeyboard,
                resize_keyboard: true,
            }
        });

    } catch (error) {
        console.error("Prisma update error:", error);
        await bot.sendMessage(chatId, "Xatolik yuz berdi, iltimos keyinroq urinib ko‘ring.");
    }
});
}
