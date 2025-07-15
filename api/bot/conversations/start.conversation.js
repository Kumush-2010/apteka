
import prisma from '../../prisma/setup.js';
import messages from '../messages.js';

const sessions = new Map();

export function startConversation(bot) {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    sessions.set(chatId, {})
    const langMessage = `
    ${messages.uz.choose_language}\n${messages.ru.choose_language}\n${messages.en.choose_language}
    `

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

      await bot.sendMessage(chatId, 'Quyidagilardan birini tanlang:', {
        reply_markup: {
          keyboard: [
            [{ text: 'Dori qidirish' }, { text: 'Profil'}],
            [{ text: 'Savat'},{ text: 'Til'}],
            [{ text: 'Bog\'lanish'}],
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      })

      sessions.delete(chatId);
    }
  });
}
