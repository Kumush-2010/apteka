import prisma from "../../prisma/setup.js";
import messages from "../messages.js";
import { getMainKeyboard } from "./start.conversation.js";

const updateState = new Map();

const texts = {
    ism: {
        uz: "Ismingizni kiriting:",
        ru: "Введите ваше имя:",
        en: "Enter your name:"
    },
    telefon: {
        uz: "📞 Telefon raqamingizni yuboring:",
        ru: "📞 Отправьте ваш номер телефона:",
        en: "📞 Send your phone number:"
    },
    til: {
        uz: "Tilni tanlang:",
        ru: "Выберите язык:",
        en: "Choose a language:"
    },
};

export function registerProfileConversation(bot) {
    const profile = /^\/?(Profil|Профиль|Profile)$/i;
    
    bot.onText(profile, async (msg) => {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id.toString();
        let session = updateState.get(chatId);

        let user = await prisma.user.findUnique({
            where: { telegramId }
        });

        if (!user) {
            // Foydalanuvchi mavjud bo'lmasa, yangi profil yaratish
            user = await prisma.user.create({
                data: {
                    telegramId,
                    language: 'uz', // Standart til O'zbekcha
                }
            });
            return bot.sendMessage(chatId, "Sizning profilingiz yaratildi. Iltimos, keyingi ma'lumotlarni kiriting.");
        }

        if (!session) {
            session = { language: user.language || 'uz' }; // Standart tilni olish
            updateState.set(chatId, session);
        }

        return bot.sendMessage(chatId, profileText(user.language, user), {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: await keyboard(session.language)
            }
        });
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const telegramId = query.from.id.toString();
        let user = await prisma.user.findUnique({
            where: { telegramId }
        });

        if (query.data === 'update_profile') {
            // Profilni yangilash uchun foydalanuvchidan ma'lumot so'rash
            updateState.set(chatId, {
                step: 'awaiting_name',
                data: {},
                telegramId
            });
            const lang = user?.language || 'uz';
            await bot.sendMessage(chatId, texts.ism[lang]);
            await bot.answerCallbackQuery(query.id);
        }

        if (query.data.startsWith('lang_')) {
            // Tilni yangilash
            const lang = query.data.replace('lang_', '');
            const state = updateState.get(chatId);
            if (!state) return;

            state.data.language = lang;

            try {
                await prisma.user.update({
                    where: { telegramId: state.telegramId },
                    data: { language: lang }
                });

                const updatedUser = await prisma.user.findUnique({
                    where: { telegramId: state.telegramId }
                });

                updateState.delete(chatId);

                return bot.sendMessage(chatId, updateProfilText(updatedUser.language, updatedUser), {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        keyboard: await getMainKeyboard(updatedUser.language),
                        resize_keyboard: true
                    }
                });
            } catch (error) {
                console.error("Tilni yangilashda xatolik:", error);
                return bot.sendMessage(chatId, "Tilni yangilashda xatolik yuz berdi.");
            }
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const state = updateState.get(chatId);

        if (!state) return;

        const lang = state?.data?.language || 'uz'; 

        // Telefon raqamini yuborish
        if (msg.contact && state.step === 'awaiting_phone') {
            const phone = msg.contact.phone_number;
            state.data.phone = phone;
            state.step = 'awaiting_language';

            return bot.sendMessage(chatId, texts.til[lang], {
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

        // Ismni kiritish
        if (state.step === 'awaiting_name') {
            state.data.name = text;
            state.step = 'awaiting_phone';
            await bot.sendMessage(chatId, texts.telefon[lang], {
                reply_markup: {
                    keyboard: [
                        [{ text: messages[lang].send_contact, request_contact: true }],
                        [{ text: "⬅️ Orqaga" }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }

        // Telefon raqamini kiritish
        if (state.step === 'awaiting_phone') {
            if (/^\+998\d{9}$/.test(text)) {
                state.data.phone = text;
                state.step = 'awaiting_language';

                await bot.sendMessage(chatId, texts.til[lang], {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🇺🇿 O‘zbek", callback_data: 'lang_uz' }],
                            [{ text: "🇷🇺 Rus", callback_data: 'lang_ru' }],
                            [{ text: "🇬🇧 English", callback_data: 'lang_en' }]
                        ]
                    }
                });
            } else {
                return bot.sendMessage(chatId, "❗️ Iltimos, +998 bilan boshlanuvchi raqam kiriting yoki kontakt ulashing.");
            }
        }
    });
}

function profileText(lang, user) {
    if (lang === 'uz') {
        return `*Profil ma'lumotlari:*\n\nIsm: ${user.name || 'Noma\'lum'}\nTelefon: ${user.phone || 'yo‘q'}\nTil: ${user.language || 'yo‘q'}`;
    } else if (lang === 'ru') {
        return `*Профильная информация:*\n\nИмя: ${user.name || 'Неизвестно'}\nТелефон: ${user.phone || 'нет'}\nЯзык: ${user.language || 'нет'}`;
    } else if (lang === 'en') {
        return `*Profile Information:*\n\nName: ${user.name || 'Unknown'}\nPhone: ${user.phone || 'not provided'}\nLanguage: ${user.language || 'not provided'}`;
    }
}

async function updateProfilText(lang, user) {
    if (lang === 'uz') {
        return `✅ *Profil yangilandi:*\n\nIsm: ${user.name}\nTelefon: ${user.phone}\nTil: ${user.language}\nTelegram ID: ${user.telegramId}`;
    } else if (lang === 'ru') {
        return `✅ *Профиль обновлен:*\n\nИмя: ${user.name}\nТелефон: ${user.phone}\nЯзык: ${user.language}\nTelegram ID: ${user.telegramId}`;
    } else if (lang === 'en') {
        return `✅ *Profile updated:*\n\nName: ${user.name}\nPhone: ${user.phone}\nLanguage: ${user.language}\nTelegram ID: ${user.telegramId}`;
    }
}

async function keyboard(lang) {
    if (lang === 'uz') {
        return [
            [{ text: 'Yangilash', callback_data: 'update_profile' }],
            [{ text: 'Savat', callback_data: 'backet' }]
        ];
    } else if (lang === 'ru') {
        return [
            [{ text: 'Обновить', callback_data: 'update_profile' }],
            [{ text: 'Корзина', callback_data: 'backet' }]
        ];
    } else if (lang === 'en') {
        return [
            [{ text: 'Update', callback_data: 'update_profile' }],
            [{ text: 'Cart', callback_data: 'backet' }]
        ];
    }
}
