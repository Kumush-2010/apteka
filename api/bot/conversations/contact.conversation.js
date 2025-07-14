
export function registerContactConversation(bot) {
    bot.onText(/Bog'lanish/, async (msg) => {
        const chatId = msg.chat.id;

        const contactText = `*Biz bilan bog'lanish uchun:*\n\n` +
            `Telefon: +998 90 438 51 14\n` +
            `Ish vaqti: 9:00 - 18:00 (Dushanba - Juma)\n\n` +
            `Savollaringiz bo'lsa, bemalol murojat qiling.\n`;

       bot.sendMessage(chatId, contactText, {
        parse_mode: 'Markdown',
       })
    })
}
