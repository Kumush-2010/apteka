
export function registerInfoConversation(bot) {
    bot.onText(/\/info/, async (msg) => {
        const chatId = msg.chat.id;

        const contactText = `*Biz haqimizda:*\n\n` +
            `Bu bot siz profil ma'lumotlaringizni boshqarish, tilni tanlashingiz va biz bilan tezda bog'lanishingiz uchun mo'ljallangan.\n\n` +
            `Savollar bo'yicha "Bog'lanish" bo'limidan foydalaning.\n\n`

       bot.sendMessage(chatId, contactText, {
        parse_mode: 'Markdown',
       })
    })
}


export function registerInfoConversation(bot) {
    bot.onText(/\/info/, async (msg) => {
        const chatId = msg.chat.id;

        const contactText = `*Biz haqimizda:*\n\n` +
            `Bu bot siz profil ma'lumotlaringizni boshqarish, tilni tanlashingiz va biz bilan tezda bog'lanishingiz uchun mo'ljallangan.\n\n` +
            `Savollar bo'yicha "Bog'lanish" bo'limidan foydalaning.\n\n`

       bot.sendMessage(chatId, contactText, {
        parse_mode: 'Markdown',
       })
    })
}
