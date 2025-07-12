import prisma from "../../prisma/setup.js";

const searchStates = new Map()

export function searchConversation(bot) {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
       const text = msg.text

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
           }[lang]

           const results = await prisma.medicine.findMany({
            where: {
                [nameField]: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            take: 5
           })

           if (results.length === 0) {
               await bot.sendMessage(chatId, `"${query}" nomli dori topilmadi.`);
           } else {
            let message = `Topilgan dorilar:\n\n`;

            for (const med of results) {
                const name = med[`${lang}_name`];
                const caption = `
                <b>${name}</b>
                Ishlab chiqaruvchi: ${med.made}
                1 disk: ${med.one_plate_price} so'm (${med.one_plate})
                1 quti: ${med.one_box_price} so'm (${med.one_box})
                Ombordagi soni: ${med.warehouse} dona
                `.trim()

                if (med.image_path) {
                    await bot.sendPhoto(chatId, med.image_path, {
                        caption,
                        parse_mode: 'HTML'
                    });
            } else {
                await bot.sendMessage(chatId, caption, {
                    parse_mode: 'HTML'
                });
            }

            await bot.sendMessage(chatId, message.trim(), {
                parse_mode: 'HTML'
            })
           }

           await bot.sendMessage(chatId, 'Quyidagilardan birini tanlang:', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Dori qidirsh'}, { text: 'Profil'}],
                    [{ text: 'Savat'}, { text: 'Til'}],
                    [{ text: 'Bog\'lanish'}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
           })
        }
    }
    })

}
