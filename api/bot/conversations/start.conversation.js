import prisma from '../../prisma/setup.js';
import messages from '../messages.js';

const sessions = new Map();

export function startConversation(bot) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    // 🔎 1. Foydalanuvchi bazada bor yoki yo‘qligini tekshiramiz
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(chatId) }
    });

    if (user) {
      const lang = user.language;
      const name = user.name;

      // 👋 2. Salomlashish va menyuni yuborish
      await bot.sendMessage(chatId, `${messages[lang].welcome_back}, ${name}!`, {
        reply_markup: {
          keyboard: getMainKeyboard(lang),
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      return;
    }

    // 🆕 Yangi foydalanuvchi uchun til tanlash oynasi
    sessions.set(chatId, {});
    const langMessage = `
    ${messages.uz.choose_language}
    ${messages.ru.choose_language}
    ${messages.en.choose_language}
    `;

    bot.sendMessage(chatId, langMessage.trim(), {
      reply_markup: {
        keyboard: [
          [{ text: 'O\'zbekcha' }],
          [{ text: 'Русский' }],
          [{ text: 'English' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    let session = sessions.get(chatId);

    if (['O\'zbekcha', 'Русский', 'English'].includes(msg.text)) {
      const lang = msg.text === 'O\'zbekcha' ? 'uz' : msg.text === 'Русский' ? 'ru' : 'en';
      session = { language: lang };
      sessions.set(chatId, session);

      bot.sendMessage(chatId, messages[lang].enter_name, {
        reply_markup: { remove_keyboard: true }
      });
      return;
    }

    if (session?.language && !session.name && msg.text) {
      session.name = msg.text;
      sessions.set(chatId, session);

      bot.sendMessage(chatId, messages[session.language].send_phone, {
        reply_markup: {
          keyboard: [[{
            text: messages[session.language].send_contact,
            request_contact: true
          }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      return;
    }

    if (msg.contact && session?.name && session?.language) {
      await prisma.user.upsert({
        where: { telegramId: BigInt(chatId) },
        update: {
          name: session.name,
          phone: msg.contact.phone_number,
          language: session.language
        },
        create: {
          telegramId: BigInt(chatId),
          name: session.name,
          phone: msg.contact.phone_number,
          language: session.language
        }
      });

      bot.sendMessage(chatId, messages[session.language].success, {
        reply_markup: { remove_keyboard: true }
      });

      await bot.sendMessage(chatId, `${messages[session.language].welcome_back}, ${session.name}!`, {
        reply_markup: {
          keyboard: getMainKeyboard(session.language),
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

      sessions.delete(chatId);
    }
  });
}

// 📋 Har bir til uchun menyu variantlari
export function getMainKeyboard(lang) {
  if (lang === 'uz') {
    return [
      [{ text: 'Dori qidirish' }, { text: 'Profil' }],
      [{ text: 'Savat' }, { text: 'Til' }],
      [{ text: 'Bog\'lanish' }]
    ];
  } else if (lang === 'ru') {
    return [
      [{ text: 'Поиск лекарства' }, { text: 'Профиль' }],
      [{ text: 'Корзина' }, { text: 'Язык' }],
      [{ text: 'Связь' }]
    ];
  } else if (lang === 'en') {
    return [
      [{ text: 'Search drug' }, { text: 'Profile' }],
      [{ text: 'Basket' }, { text: 'Language' }],
      [{ text: 'Contact' }]
    ];
  }
}


