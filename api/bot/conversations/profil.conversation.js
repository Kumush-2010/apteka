import prisma from "../../prisma/setup.js";
import messages from "../messages.js";
import { getMainKeyboard } from "./start.conversation.js";

const updateState = new Map();

const texts = {
  ism: {
    uz: "Ismingizni kiriting:",
    ru: "Введите ваше имя:",
    en: "Enter your name:",
  },
  telefon: {
    uz: "📞 Telefon raqamingizni yuboring:",
    ru: "📞 Отправьте ваш номер телефона:",
    en: "📞 Send your phone number:",
  },
  til: {
    uz: "Tilni tanlang:",
    ru: "Выберите язык:",
    en: "Choose a language:",
  },
};

export function registerProfileConversation(bot) {
  const profile = /^\/?(Profil|Профиль|Profile)$/i;

  bot.onText(profile, async (msg) => {
    const chatId = msg.chat.id;
    // console.log("Profil so'rovi:", chatId);
    
    const telegramId = msg.from.id.toString();
    let session = updateState.get(chatId);

    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      // Foydalanuvchi mavjud bo'lmasa, yangi profil yaratish
      user = await prisma.user.create({
        data: {
          telegramId,
          language: "uz",
        },
      });
      return bot.sendMessage(
        chatId,
        "✅ Profil yaratildi. Iltimos, ma'lumotlarni kiritishda davom eting."
      );
    }

    if (!session) {
      session = { language: user.language || "uz" };
      updateState.set(chatId, session);
    }

    return bot.sendMessage(chatId, profileText(user.language, user), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: await keyboard(session.language),
      },
    });
  });

  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    // console.log("Callback", chatId);
    
    const telegramId = query.from.id.toString();  
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (query.data === "update_profile") {
      updateState.set(chatId, {
        step: "awaiting_name",
        data: {},
        telegramId,
      });
      const lang = user?.language || "uz";
      await bot.sendMessage(chatId, texts.ism[lang]);
      return bot.answerCallbackQuery(query.id);
    }

    if (query.data.startsWith("lang_")) {
      const lang = query.data.replace("lang_", "");
      const state = updateState.get(chatId);
      if (!state) return;

      state.data.language = lang; // Tilni yangilash

      try {
        await prisma.user.update({
          where: { telegramId: state.telegramId },
          data: { language: lang }, // Tilni bazada yangilash
        });

        const updatedUser = await prisma.user.findUnique({
          where: { telegramId: state.telegramId },
        });

        updateState.delete(chatId); // Sessiyani tozalash

        // Yangi profilni ko'rsatish
        const profileTextUpdated = await updateProfilText(
          updatedUser.language,
          updatedUser
        );
        if (!profileTextUpdated || typeof profileTextUpdated !== "string" || profileTextUpdated.trim() === "") {
          console.error("Bo'sh matn yuborilyapti:", profileTextUpdated);
          return bot.sendMessage(chatId, "Xatolik: profil matni bo'sh.");
          // throw new Error("Xabar matni bo'sh.");
        }

        const mainKeyboard = await getMainKeyboard(updatedUser.language);

        return bot.sendMessage(chatId, profileTextUpdated, {
          parse_mode: "MarkdownV2",
          reply_markup: {
            keyboard: mainKeyboard,
            resize_keyboard: true,
          },
        });
      } catch (error) {
        console.error("Tilni yangilashda xatolik:", error);
        return bot.sendMessage(
          chatId,
          "❗️ Tilni yangilashda xatolik yuz berdi."
        );
      }
    }
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    // console.log("Profil so'roviga javob:", chatId);
    const telegramId = msg.from.id.toString();
    const state = updateState.get(chatId);

    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!state) return;

    const lang = user?.language || "uz";

    // Telefon raqamini kontakt orqali yuborish
    if (msg.contact && state.step === "awaiting_phone") {
      const phone = msg.contact.phone_number;
      state.data.phone = phone;
      state.step = "awaiting_language";

      // Telefonni yangilash
      await prisma.user.update({
        where: { telegramId: user.telegramId },
        data: { phone: phone }, // Telefon raqamini yangilash
      });

      await bot.sendMessage(chatId, texts.til[lang], {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🇺🇿 O‘zbek", callback_data: "lang_uz" }],
            [{ text: "🇷🇺 Rus", callback_data: "lang_ru" }],
            [{ text: "🇬🇧 English", callback_data: "lang_en" }],
          ],
        },
      });
    }

    const text = msg.text?.trim();
    if (!text) return;

    // Ismni kiritish
    if (state.step === "awaiting_name") {
      if (!text) {
        return bot.sendMessage(chatId, "❗️ Iltimos, ismingizni kiriting.");
      }
      state.data.name = text;
      state.step = "awaiting_phone";

      // Ismni yangilash
      await prisma.user.update({
        where: { telegramId: user.telegramId },
        data: { name: text }, // Ismni yangilash
      });

      await bot.sendMessage(chatId, texts.telefon[lang], {
        reply_markup: {
          keyboard: [
            [{ text: messages[lang].send_contact, request_contact: true }],
            [{ text: "⬅️ Orqaga" }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        }, 
      });
    }

    // Telefon raqamini qo'lda kiritish
    if (state.step === "awaiting_phone") {
      if (/^\+998\d{9}$/.test(text)) {
        state.data.phone = text;
        state.step = "awaiting_language";

        // Telefonni yangilash
        await prisma.user.update({
          where: { telegramId: user.telegramId },
          data: { phone: text }, // Telefon raqamini yangilash
        });

        await bot.sendMessage(chatId, texts.til[lang], {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🇺🇿 O‘zbek", callback_data: "lang_uz" }],
              [{ text: "🇷🇺 Rus", callback_data: "lang_ru" }],
              [{ text: "🇬🇧 English", callback_data: "lang_en" }],
            ],
          },
        });
      } else {
        return bot.sendMessage(
          chatId,
          "❗️ Telefon raqamini noto‘g‘ri formatda kiritdingiz."
        );
      }
    }
  });
}

function profileText(lang, user) {
  switch (lang) {
    case "uz":
      return `*Profil ma'lumotlari:*\n\nIsm: ${
        user.name || "Noma'lum"
      }\nTelefon: ${user.phone || "yo‘q"}\nTil: ${user.language || "yo‘q"}`;
    case "ru":
      return `*Профильная информация:*\n\nИмя: ${
        user.name || "Неизвестно"
      }\nТелефон: ${user.phone || "нет"}\nЯзык: ${user.language || "нет"}`;
    case "en":
      return `*Profile Information:*\n\nName: ${
        user.name || "Unknown"
      }\nPhone: ${user.phone || "not provided"}\nLanguage: ${
        user.language || "not provided"
      }`;
    default:
      return "*Profil mavjud emas*";
  }
}

async function updateProfilText(lang, user) {
  if (!user) {
    console.error("User object yo'q.");
    return "❗️ Foydalanuvchi ma'lumotlari topilmadi.";
  }
  // return "Profil yangiladi"

  const name = escapeMarkdownV2(user.name || "Noma'lum");
  const phone = escapeMarkdownV2(user.phone || "yo‘q");
  const language = escapeMarkdownV2(user.language || "yo‘q");
  return (
    {
      uz: `✅ *Profil yangilandi:*\n\n👤 Ism: ${
        name || "Noma'lum"
      }\n📞 Telefon: ${phone || "yo‘q"}\n🌐 Til: ${language}`,
      ru: `✅ *Профиль обновлен:*\n\n👤 Имя: ${
        name || "Неизвестно"
      }\n📞 Телефон: ${phone || "нет"}\n🌐 Язык: ${language}`,
      en: `✅ *Profile updated:*\n\n👤 Name: ${
        name || "Unknown"
      }\n📞 Phone: ${phone || "not provided"}\n🌐 Language: ${
        language
      }`,
    }[lang] || "Profil yangilandi."
  );
}

async function keyboard(lang) {
  switch (lang) {
    case "uz":
      return [
        [{ text: "Yangilash", callback_data: "update_profile" }],
        // [{ text: "⬅️ Orqaga" }],
      ];
    case "ru":
      return [
        [{ text: "Обновить", callback_data: "update_profile" }],
        // [{ text: "⬅️ Назад" }],
      ];
    case "en":
      return [
        [{ text: "Update", callback_data: "update_profile" }],
        // [{ text: "⬅️ Back" }],
      ];
    default:
      return [
        [{ text: "Update", callback_data: "update_profile" }],
        // [{ text: "⬅️ Back" }],
      ];
  }
}


function escapeMarkdownV2(text) {
  return text
  .replace(/_/g, "\\_")
  .replace(/\*/g, "\\*")
  .replace(/\[/g, "\\[")
  .replace(/\]/g, "\\]")
  .replace(/\(/g, "\\(")
  .replace(/\)/g, "\\)")
  .replace(/~/g, "\\~")
  .replace(/`/g, "\\`")
  .replace(/>/g, "\\>")
  .replace(/#/g, "\\#")
  .replace(/\+/g, "\\+")
  .replace(/-/g, "\\-")
  .replace(/=/g, "\\=")
  .replace(/\|/g, "\\|")
  .replace(/{/g, "\\{")
  .replace(/}/g, "\\}")
  .replace(/:/g, "\\:")
  .replace(/!/g, "\\!")
  .replace(/,/g, "\\,")
  .replace(/\./g, "\\.")
  .replace(/"/g, "\\\"")
  .replace(/'/g, "\\'");
}