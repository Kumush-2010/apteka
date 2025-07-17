import prisma from '../../prisma/setup.js';

export function registerInfoConversation(bot) {
  bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id;

    // Foydalanuvchining tilini olish
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(chatId) }
    });

    if (!user) {
      return bot.sendMessage(chatId, "Iltimos, avval ro'yxatdan o'ting (/start).");
    }

    const lang = user.language;
    const text = contactText(lang);

    if (text) {
      await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown'
      });
    } else {
      await bot.sendMessage(chatId, "Til bo‘yicha ma’lumot topilmadi.");
    }
  }); 
}

// Matnlarni tilga qarab qaytaradigan funksiya
function contactText(lang) {
  if (lang === 'uz') {
    return `*Biz haqimizda:*\n\n` +
      `Bu bot siz profil ma'lumotlaringizni boshqarish, tilni tanlashingiz va biz bilan tezda bog'lanishingiz uchun mo'ljallangan.\n\n` +
      `Savollar bo'yicha "Bog'lanish" bo‘limidan foydalaning.`;
  } else if (lang === 'ru') {
    return `*О нас:*\n\n` +
      `Этот бот предназначен для управления вашими профилями, выбора языка и быстрого контакта с нами.\n\n` +
      `Используйте раздел "Связь" для вопросов.`;
  } else if (lang === 'en') {
    return `*About us:*\n\n` +
      `This bot is designed for managing your profile information, selecting a language, and quickly contacting us.\n\n` +
      `Use the "Contact" section for any questions.`;
  }
  return null;
}
