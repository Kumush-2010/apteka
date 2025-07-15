import prisma from "../../prisma/setup.js";

const updateState = new Map();

export function registerProfileConversation(bot) {
    // Profilni ko‘rsatish
    bot.onText(/Profil/, async (msg) => {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id.toString();

        const user = await prisma.user.findUnique({
            where: { telegramId }
        });

        if (!user) {
            return bot.sendMessage(chatId, "Profil topilmadi.");
        }

        const profileText = `*Profil ma'lumotlari:*\n\n` +
            `Ism: ${user.name || 'Noma\'lum'}\n` +
            `Telefon: ${user.phone || 'yo‘q'}\n` +
            `Til: ${user.language || 'yo‘q'}\n` +
            `Telegram ID: ${user.telegramId}\n`;

        return bot.sendMessage(chatId, profileText, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Yangilash', callback_data: 'update_profile' }, { text: 'Savat', callback_data: 'backet' }],
                ]
            }
        });
    });

    // Callback query (Yangilash bosilganda)
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const telegramId = query.from.id.toString();

        if (query.data === 'update_profile') {
            updateState.set(chatId, {
                step: 'awaiting_name',
                data: {},
                telegramId
            });

            await bot.sendMessage(chatId, "Ismingizni kiriting:");
            await bot.answerCallbackQuery(query.id);
        }

        // Tilni tanlash
        if (query.data.startsWith('lang_')) {
            const lang = query.data.replace('lang_', '');
            const state = updateState.get(chatId);
            if (!state) return;

            state.data.language = lang;

            // Ma'lumotlarni yangilash
            await prisma.user.update({
                where: { telegramId: state.telegramId },
                data: state.data
            });

            updateState.delete(chatId);

            const updatedUser = await prisma.user.findUnique({
                where: { telegramId: state.telegramId }
            });

            const profileText = `✅ *Profil yangilandi:*\n\n` +
                `Ism: ${updatedUser.name}\n` +
                `Telefon: ${updatedUser.phone}\n` +
                `Til: ${updatedUser.language}\n` +
                `Telegram ID: ${updatedUser.telegramId}`;

            return bot.sendMessage(chatId, profileText, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [
                        [{ text: 'Dori qidirish' }, { text: 'Profil' }],
                        [{ text: 'Savat' }, { text: 'Til' }],
                        [{ text: 'Bog\'lanish' }]
                    ],
                    resize_keyboard: true
                }
            });
        }
    });

    // Matn yoki contact qabul qilish
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const state = updateState.get(chatId);
        if (!state) return;

        // Contact yuborilgan bo‘lsa
        if (msg.contact && state.step === 'awaiting_phone') {
            const phone = msg.contact.phone_number;
            state.data.phone = phone;
            state.step = 'awaiting_language';

            return bot.sendMessage(chatId, "Tilni tanlang:", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🇺🇿 O‘zbek", callback_data: 'lang_uz' }],
                        [{ text: "🇷🇺 Rus", callback_data: 'lang_ru' }],
                        [{ text: "🇬🇧 English", callback_data: 'lang_en' }]
                    ]
                }
            });
        }

        const text = msg.text?.trim();

        if (state.step === 'awaiting_name') {
            state.data.name = text;
            state.step = 'awaiting_phone';

            return bot.sendMessage(chatId, "📞 Telefon raqamingizni yuboring:", {
                reply_markup: {
                    keyboard: [
                        [{ text: "📲 Raqamni ulashish", request_contact: true }],
                        [{ text: "⬅️ Orqaga" }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }

        if (state.step === 'awaiting_phone') {
            if (/^\+998\d{9}$/.test(text)) {
                state.data.phone = text;
                state.step = 'awaiting_language';

                return bot.sendMessage(chatId, "Tilni tanlang:", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🇺🇿 O‘zbek", callback_data: 'lang_uz' }],
                            [{ text: "🇷🇺 Rus", callback_data: 'lang_ru' }],
                            [{ text: "🇬🇧 English", callback_data: 'lang_en' }]
                        ]
                    }
                });
            } else {
                return bot.sendMessage(chatId, "❗ Iltimos, +998 bilan boshlanuvchi raqam kiriting yoki kontakt ulashing.");
            }
        }
    });
}
