import prisma from "../../prisma/setup.js";

export function registerLanguageConversation(bot) {
    bot.onText(/Til/, async (msg) => {
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
            uz: 'O\'zbekcha',
            ru: 'Русский',
            en: 'English'
        }[lang] || 'Tanlanmagan';

        try {
            await prisma.user.update({
                where: { telegramId: telegramId },
                data: { language: lang }
            });

            await bot.editMessageText(`Til muvaffaqiyatli o'zgartirildi: ${languageName}`, {
                chat_id: chatId,
                message_id: query.message.message_id,
            });
        } catch (error) {
            console.error("Prisma update error:", error);
            await bot.sendMessage(chatId, "Xatolik yuz berdi, iltimos keyinroq urinib ko‘ring.");
        }
    });
}
