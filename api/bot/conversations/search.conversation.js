import { BUCKET_NAME, SUPABASE_URL } from "../../config/config.js";
import prisma from "../../prisma/setup.js";

const searchStates = new Map();
const searchResultsMap = new Map();

const texts = {
    search_prompt: {
        uz: "Qidirayotgan dori nomini kiriting:",
        ru: "Введите название лекарства для поиска:",
        en: "Enter the medicine name to search:"
    },
    not_found: {
        uz: '"{query}" nomli dori topilmadi.',
        ru: 'Лекарство с названием "{query}" не найдено.',
        en: 'No medicine found with the name "{query}".'
    },
    choose_from_list: {
        uz: "Quyidagilardan birini tanlang:",
        ru: "Выберите из списка:",
        en: "Choose from the list:"
    },
    found_medicines: {
        uz: "Topilgan dorilar:",
        ru: "Найденные лекарства:",
        en: "Found medicines:"
    },
    add_to_cart: {
        uz: "Savatga qo‘shish",
        ru: "Добавить в корзину",
        en: "Add to cart"
    },
    added_to_cart: {
        uz: "Savatga qo‘shildi ✅",
        ru: "Добавлено в корзину ✅",
        en: "Added to cart ✅"
    },
    unknown_pharmacy: {
        uz: "Noma'lum apteka",
        ru: "Неизвестная аптека",
        en: "Unknown pharmacy"
    },
    unknown_phone: {
        uz: "Noma'lum telefon",
        ru: "Неизвестный номер",
        en: "Unknown phone"
    },
    unknown_address: {
        uz: "Noma'lum manzil",
        ru: "Неизвестный адрес",
        en: "Unknown address"
    }
};

// 🧠 Foydalanuvchi tilini olish uchun yordamchi funksiya
async function getUserLang(chatId) {
    const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId) }
    });
    return user?.language || 'uz';
}

export function searchConversation(bot) {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text?.trim();

        const commandRegex = /^\/?(Dori qidirish|Search drug|Поиск лекарства)$/i;

        if (commandRegex.test(text)) {
            searchStates.set(chatId, 'awaiting_query');

            const lang = await getUserLang(chatId);
            return bot.sendMessage(chatId, texts.search_prompt[lang]);
        }

        if (searchStates.get(chatId) === 'awaiting_query') {
            searchStates.delete(chatId);

            const query = text;
            const lang = await getUserLang(chatId);

            const nameField = {
                uz: 'uz_name',
                ru: 'ru_name',
                en: 'en_name'
            }[lang];

            const results = await prisma.medicine.findMany({
                where: {
                    [nameField]: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                take: 5,
                include: {
                    pharmacy: true
                }
            });

            if (results.length === 0) {
                const notFoundText = texts.not_found[lang].replace('{query}', query);
                return bot.sendMessage(chatId, notFoundText);
            }

            searchResultsMap.set(chatId, results);

            let message = `<b>${texts.found_medicines[lang]}</b>\n\n`;
            results.forEach((med, index) => {
                message += `${index + 1}. ${med[nameField]} — ${med.gram}g\n`;
            });

            const inlineKeyboard = results.map((_, index) => [{
                text: `${index + 1}`,
                callback_data: `select_med_${index}`
            }]);

            await bot.sendMessage(chatId, message, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: inlineKeyboard
                }
            });
        }
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        const lang = await getUserLang(chatId);

        if (data.startsWith('select_med_')) {
            const index = parseInt(data.split('select_med_')[1], 10);
            const results = searchResultsMap.get(chatId);
            if (!results || !results[index]) return;

            const med = results[index];

            const nameField = {
                uz: 'uz_name',
                ru: 'ru_name',
                en: 'en_name'
            }[lang];

            const name = med[nameField];
            const pharmacyName = med.pharmacy.name || texts.unknown_pharmacy[lang];
            const phone = med.pharmacy.phone || texts.unknown_phone[lang];
            const destination = med.pharmacy.destination || texts.unknown_address[lang];
            const address = med.pharmacy.address || texts.unknown_address[lang];
            const locationUrl = med.pharmacy.locationUrl || '#';

            const imageUrl = med.image_path?.startsWith('http')
                ? med.image_path
                : `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${med.image_path}`;

            const caption = `
<b>${name}</b>
🏭 Ishlab chiqaruvchi: ${med.made}
📦 Omborda: ${med.warehouse} dona

💊 1 disk: ${med.one_plate_price} so'm (${med.one_plate})
📦 1 quti: ${med.one_box_price} so'm (${med.one_box})

🏪 Apteka: ${pharmacyName}
📍 Manzil: ${address}
🧭 Mo'ljal: ${destination}
📞 Tel: ${phone}
🌐 <a href="${locationUrl}">Joylashuv</a>
            `.trim();

            const inlineKeyboard = {
                inline_keyboard: [
                    [{
                        text: texts.add_to_cart[lang],
                        callback_data: `add_to_cart_${med.id}`
                    }]
                ]
            };

            if (imageUrl && imageUrl.startsWith('http')) {
                await bot.sendPhoto(chatId, imageUrl, {
                    caption,
                    parse_mode: 'HTML',
                    reply_markup: inlineKeyboard
                });
            } else {
                await bot.sendMessage(chatId, caption, {
                    parse_mode: 'HTML',
                    reply_markup: inlineKeyboard,
                    disable_web_page_preview: true
                });
            }
        }

        if (data.startsWith('add_to_cart_')) {
            await bot.answerCallbackQuery(query.id, {
                text: texts.added_to_cart[lang],
                show_alert: false
            });
        }
    });
}
