
import { BUCKET_NAME } from "../../config/config.js";
import prisma from "../../prisma/setup.js";

const searchStates = new Map();

export function searchConversation(bot) {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === 'Dori qidirish') {
            searchStates.set(chatId, 'awaiting_query');
            return bot.sendMessage(chatId, 'Qidirayotgan dori nomini kiriting:');
        }

        if (searchStates.get(chatId) === 'awaiting_query') {
            searchStates.delete(chatId);

            const query = text.trim();

            const user = await prisma.user.findUnique({
                where: { telegramId: BigInt(chatId) }
            });

            const lang = user?.language || 'uz';

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
                await bot.sendMessage(chatId, `"${query}" nomli dori topilmadi.`);
            } else {
                for (const med of results) {
                    const name = med[`${lang}_name`];
                    const pharmacyName = med.pharmacy?.name || 'Noma’lum apteka';
                    const phone = med.pharmacy?.phone || 'Noma’lum telefon';
                    const destination = med.pharmacy?.destination || 'Noma’lum manzil';
                    const address = med.pharmacy?.address || 'Noma’lum manzil';
                    const locationUrl = med.pharmacy?.locationUrl || '#';

                    // Rasm URL yasash
                    const imageUrl = med.image_path?.startsWith('http')
  ? med.image_path
  : `https://ypbaqciwlliayetfafyr.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${med.image_path}`;

                    const caption = `
<b>${name}</b>
🏭 Ishlab chiqaruvchi: ${med.made}
📦 Omborda: ${med.warehouse} dona

💊 1 disk: ${med.one_plate_price} so'm (${med.one_plate})+
📦 1 quti: ${med.one_box_price} so'm (${med.one_box})

🏪 Apteka: ${pharmacyName}
📍 Manzil: ${address}
🧭 Mo'ljal: ${destination}
📞 Tel: ${phone}
🌐 <a href="${locationUrl}">Joylashuv</a>
                    `.trim();

                    const inlineKeyboard = {
                        inline_keyboard: [[
                            {
                                text: '🛒 Savatga qo‘shish',
                                callback_data: `add_to_cart_${med.id}`
                            }
                        ]]
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

                // Asosiy menyu tugmalari
                await bot.sendMessage(chatId, 'Quyidagilardan birini tanlang:', {
                    reply_markup: {
                        keyboard: [
                            [{ text: 'Dori qidirish' }, { text: 'Profil' }],
                            [{ text: 'Savat' }, { text: 'Til' }],
                            [{ text: 'Bog\'lanish' }]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                });
            }
        }
    });

    // Savatga qo‘shish tugmasi uchun callback handler
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        if (data.startsWith('add_to_cart_')) {
            const medId = parseInt(data.split('add_to_cart_')[1]);

            // Bu yerga savatga qo‘shish logikasini yozing (hozircha faqat xabar)
            await bot.answerCallbackQuery(query.id, {
                text: 'Savatga qo‘shildi ✅',
                show_alert: false
            });
        }
    });
}
