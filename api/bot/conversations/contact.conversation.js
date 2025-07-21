
export function registerContactConversation(bot) {
    const contact = /^\/?(Bog'lanish|Contact|Связь)$/i;
    bot.onText(contact, async (msg) => {
        const chatId = msg.chat.id;

       bot.sendMessage(chatId, contactText, {
        parse_mode: 'Markdown',
       })
    })
}

function contactText(lang) {   
    if (lang === 'uz') {
        return `*Biz bilan bog'lanish uchun:*\n\n` +
            `Telefon: +998904385114\n` +
            `Ish vaqti: 9:00 - 18:00 (Dushanba - Juma)\n\n`;
    } else if (lang === 'ru') {
        return `*Связаться с нами:*\n\n` +
            `Телефон: +998904385114\n` +
            `Время работы: 9:00 - 18:00 (Понедельник - Пятница)\n\n`;
    } else if (lang === 'en') {
        return `*Contact us:*\n\n` +
            `Phone: +998904385114\n` +
            `Working hours: 9:00 AM - 6:00 PM (Monday - Friday)\n\n`;
    }
    return null;
}