
import prisma from "../../prisma/setup.js";

// --- Matnlar ---
const texts = {
  cart_empty: { uz: "Savat bo'sh.", ru: "Корзина пуста.", en: "Cart is empty." },
  cart_header: { uz: "🛒 Savatdagi mahsulotlar:", ru: "🛒 Товары в корзине:", en: "🛒 Items in cart:" },
  cart_summary: {
    uz: (count) => `Jami: ${count} ta mahsulot.`,
    ru: (count) => `Всего: ${count} товаров.`,
    en: (count) => `Total: ${count} items.`
  },
  removed: { uz: "O‘chirildi.", ru: "Удалено.", en: "Deleted." },
  error_fetch: { uz: "Xatolik yuz berdi.", ru: "Произошла ошибка.", en: "An error occurred." },
  choose_location: { uz: "Manzilni tanlang:", ru: "Выберите адрес:", en: "Choose address:" },
  current_location_btn: { uz: "📍 Hozirgi joyim", ru: "📍 Мое местоположение", en: "📍 My current location" },
  delivery_location_btn: { uz: "📦 Yetkazib beriladigan manzil", ru: "📦 Адрес доставки", en: "📦 Delivery address" },
  ask_delivery_location: { uz: "Yetkazib beriladigan manzilni matn ko‘rinishida kiriting:", ru: "Введите адрес доставки текстом:", en: "Enter delivery address:" },
  ask_current_location: { uz: "Iltimos, hozirgi joyingizni yuboring:", ru: "Пожалуйста, отправьте ваше текущее местоположение:", en: "Please send your current location:" },
  ask_payment: { uz: "To‘lovni amalga oshirish uchun tugmani bosing:", ru: "Нажмите кнопку для оплаты:", en: "Press the button to pay:" },
  order_created: { uz: "✅ Buyurtma qabul qilindi", ru: "✅ Заказ принят", en: "✅ Order placed" },
  empty_cart_alert: { uz: "Savat bo'sh.", ru: "Корзина пуста.", en: "Cart is empty." },
  user_not_found: { uz: "Foydalanuvchi topilmadi.", ru: "Пользователь не найден.", en: "User not found." }
};

const PAYMENT_METHODS = [
  { text: "💳 Click", callback_data: "pay_click" },
  { text: "💳 Payme", callback_data: "pay_payme" },
  { text: "🏦 UzumBank", callback_data: "pay_uzum" },
  { text: "💵 Naqt", callback_data: "pay_cash" }
];

// --- Holat saqlash ---
const orderState = new Map(); // telegramId -> { step, lang, cartItems, currentLocation, deliveryLocation }

async function askPaymentMethod(bot, chatId, lang) {
  await bot.sendMessage(chatId, texts.ask_payment[lang], {
    reply_markup: {
      inline_keyboard: [
        [PAYMENT_METHODS[0], PAYMENT_METHODS[1]],
        [PAYMENT_METHODS[2], PAYMENT_METHODS[3]]
      ]
    }
  });
}

// --- Yordamchi funksiyalar ---
async function getUserLang(chatId) {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(chatId) }
  });
  return user?.language || "uz";
}

async function getCart(telegramId) { 
  const tid = BigInt(telegramId);
  const user = await prisma.user.findUnique({
    where: { telegramId: tid },
    include: { cartItems: true }
  });
  return user?.cartItems || [];
}

async function removeCartItem(telegramId, itemName) {
  const tid = BigInt(telegramId);
  const user = await prisma.user.findUnique({
    where: { telegramId: tid }
  });
  if (!user) return;
  await prisma.cartItem.deleteMany({
    where: {
      userId: user.id,
      name: itemName
    }
  });
}

// --- Savatni yuborish ---
async function sendCart(bot, chatId, telegramId) {
  const lang = await getUserLang(chatId);
  try {
    const items = await getCart(telegramId);
    if (!items || items.length === 0) {
      return bot.sendMessage(chatId, texts.cart_empty[lang]);
    }

    let message = `<b>${texts.cart_header[lang]}</b>\n\n`;
    items.forEach((it, idx) => {
      message += `${idx + 1}. <b>${it.name}</b> — ${it.quantity}\n`;
    });
    if (items.length >= 2) {
      message += `\n<em>${texts.cart_summary[lang](items.length)}</em>`;
    }

    const inline_keyboard = [
      ...items.map(it => ([{
        text: `🗑 ${it.name}`,
        callback_data: `remove_${encodeURIComponent(it.name)}`
      }])),
      [{
        text: "📦 Buyurtma berish",
        callback_data: "place_order"
      }]
    ];

    await bot.sendMessage(chatId, message, {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard }
    });
  } catch (err) {
    console.error("Savatni olishda xato:", err);
    bot.sendMessage(chatId, texts.error_fetch[lang]);
  }
}

// --- Buyurtma yaratish yordamchisi ---
 async function proceedToPaymentAndCreateOrder(bot, telegramId, chatId, state) {
  const lang = state?.lang || (await getUserLang(chatId));
  const cartItems = state?.cartItems || [];
  if (cartItems.length === 0) {
    await bot.sendMessage(chatId, texts.empty_cart_alert[lang]);
    return;
  }

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) }
  });                                                                                                                                                                                                                                                
  if (!user) {
    await bot.sendMessage(chatId, texts.user_not_found[lang]);
    orderState.delete(telegramId);
    return;
  }

  try {
    // Narxlarni hisoblash
    // let totalPrice = 0;
    // for (const item of cartItems) {
    //   const price = item.medicine?.price || 0; 
    //   totalPrice += price * item.quantity;
    // }    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: Number(telegramId) },
      include: { medicine: true }
    })
    const totalPrice = cartItems.reduce((total, item) => {
      if (item.medicine && item.medicine.one_plate_price) {
        return total + item.medicine.one_plate_price * item.quantity
      } else {
        console.log("Medicine yo'q yoki price yo'q:", item);
        return total
      }
    }, 0)


  
    // Yetkazish narxi
    const deliveryFee = 10000;
    totalPrice += deliveryFee;
    console.log(totalPrice)
    const order = await prisma.order.create({
      data: {
        user: { connect: { id: user.id } },
        status: "pending",
        totalPrice,
        currentLocation: state.currentLocation || null,
        deliveryLocation: state.deliveryLocation || null,                                                                                 
        items: {
          create: cartItems.map(it => ({
            name: it.name,
            quantity: it.quantity,
            price: it.medicine.price 
          }))
        }
      },
      include: { items: true }
    });

    // Savatni tozalash
    await prisma.cartItem.deleteMany({
      where: { userId: user.id }
    });

    const lines = order.items.map(i => `${i.name} - ${i.quantity} x ${i.price} = ${i.quantity * i.price}`).join("\n");
    const summary = `<b>${texts.order_created[lang]}</b>\n` +
      `Buyurtma №${order.id}\n` +
      `Holat: ${order.status}\n` +
      `Hozirgi joy: ${order.currentLocation || "-"}\n` +
      `Yetkazish manzili: ${order.deliveryLocation || "-"}\n\n` +
      `Mahsulotlar:\n${lines}\n\n` +
      `🚚 Yetkazish narxi: ${deliveryFee} so‘m\n` +
      `💰 Umumiy: ${totalPrice} so‘m`;

    await bot.sendMessage(chatId, summary, { parse_mode: "HTML" });
    orderState.delete(telegramId);
  } catch (err) {
    console.error("Buyurtma yaratishda xato:", err);
    await bot.sendMessage(chatId, texts.error_fetch[lang]);
  }
}

// --- Export qilingan funksiyalar ---
export function getCartItems(bot) {
  const getsCart = /^\/?(Savat|Basket|Корзина)$/i;

  bot.onText(getsCart, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id;
    if (!telegramId) return;
    await sendCart(bot, chatId, telegramId);
  });
}

export function setupOrderFlow(bot) {
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const telegramId = query.from?.id;
    if (!telegramId) return;
    const data = query.data;
    const lang = await getUserLang(chatId);
    const state = orderState.get(telegramId) || {};

    // Boshlanish: buyurtma berish bosildi
    if (data === "place_order") {
      const cartItems = await getCart(telegramId);
      if (!cartItems || cartItems.length === 0) {
        await bot.answerCallbackQuery(query.id, { text: texts.empty_cart_alert[lang], show_alert: true });
        return;
      }

      // Boshlang'ich holat
      orderState.set(telegramId, {
        step: "choose_location",
        lang,
        cartItems
      });

      await bot.sendMessage(chatId, texts.choose_location[lang], {
        reply_markup: {
          inline_keyboard: [
            [{ text: texts.current_location_btn[lang], callback_data: "loc_current" }],
            [{ text: texts.delivery_location_btn[lang], callback_data: "loc_delivery" }]
          ]
        }
      });
      await bot.answerCallbackQuery(query.id);
      return;
    }

    // Hozirgi joy tanlandi
    if (data === "loc_current") {
      if (!state.cartItems) return;
      state.step = "waiting_current_location";
      orderState.set(telegramId, state);
      await bot.sendMessage(chatId, texts.ask_current_location[lang], {
        reply_markup: {
          keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      await bot.answerCallbackQuery(query.id);
      return;
    }

    // Yetkazib berish manzili tanlandi
    if (data === "loc_delivery") {
      if (!state.cartItems) return;
      state.step = "waiting_delivery_location";
      orderState.set(telegramId, state);
      await bot.sendMessage(chatId, texts.ask_delivery_location[lang], {
        reply_markup: { remove_keyboard: true }
      });
      await bot.answerCallbackQuery(query.id);
      return;
    }


    // Agar mahsulotni o‘chirish
    if (data.startsWith("remove_")) {
      const name = decodeURIComponent(data.replace("remove_", ""));
      try {
        await removeCartItem(telegramId, name);
        await bot.answerCallbackQuery(query.id, { text: texts.removed[lang], show_alert: false });
        await sendCart(bot, chatId, telegramId);
      } catch (err) {
        console.error("Itemni o'chirishda xato:", err);
        await bot.answerCallbackQuery(query.id, { text: texts.error_fetch[lang], show_alert: true });
      }
      return;
    }

    // To‘lovga o‘tish tugmasi (agar button qo‘yilgan bo‘lsa)
    if (data === "do_payment") {
      const currentState = orderState.get(telegramId);
      if (!currentState) return;
      // Bu yerda haqiqiy to‘lov joylashtirish mumkin, hozircha to‘g‘ridan-to‘g‘ri buyurtma
      console.log("TelegramId:", telegramId);
      await proceedToPaymentAndCreateOrder(bot, telegramId, chatId, currentState);
      await bot.answerCallbackQuery(query.id);
      return;
    }
  });

  // Location kelganda
  bot.on("location", async (msg) => {
    const telegramId = msg.from?.id;
    const chatId = msg.chat.id;
    if (!telegramId) return;

      
    const state = orderState.get(telegramId);
    if (!state) return;
    const lang = state.lang || (await getUserLang(chatId));

    if (state.step === "waiting_current_location") {
      state.currentLocation = `${msg.location.latitude},${msg.location.longitude}`;
      // Endi agar yetkaziladigan manzil hali yo‘q bo‘lsa so‘raymiz
      if (!state.deliveryLocation) {
        state.step = "waiting_delivery_location"; 
        orderState.set(telegramId, state);
        await bot.sendMessage(chatId, texts.ask_delivery_location[lang], { reply_markup: { remove_keyboard: true } });
        return;
      }
      // Ikkala manzil bor — to‘lovga o‘tish
      state.step = "awaiting_payment";
      orderState.set(telegramId, state);
      await bot.sendMessage(chatId, texts.ask_payment[lang], {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 To‘lov qilish", callback_data: "do_payment" }],
            [{ text: "❌ Bekor qilish", callback_data: "cancel_order" }]
          ]
        }
      });
    }
  });

  // Matn (delivery location)
  bot.on("message", async (msg) => {
    const telegramId = msg.from?.id;
    const chatId = msg.chat.id;
    if (!telegramId) return;
    const state = orderState.get(telegramId);
    if (!state) return;
    const lang = state.lang || (await getUserLang(chatId));

    // Agar yetkazib berish manzili kiritilayotgan bo‘lsa
    if (state.step === "waiting_delivery_location" && msg.text) {
      state.deliveryLocation = msg.text.trim();
      // Endi agar hozirgi joy yo‘q bo‘lsa so‘ramiz
      if (!state.currentLocation) {
        state.step = "waiting_current_location";
        orderState.set(telegramId, state);
        await bot.sendMessage(chatId, texts.ask_current_location[lang], {
          reply_markup: {
            keyboard: [[{ text: "📍 Joylashuvni yuborish", request_location: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        });
        return;
      }
      // Ikkala manzil bor — to‘lovga o‘tish
      state.step = "awaiting_payment";
      orderState.set(telegramId, state);
      await bot.sendMessage(chatId, texts.ask_payment[lang], {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 To‘lov qilish", callback_data: "do_payment" }],
            [{ text: "❌ Bekor qilish", callback_data: "cancel_order" }]
          ]
        }      
      });
      return;
    }

    // Bekor qilish tugmasi
    if (state.step === "awaiting_payment" && msg.text === "❌ Bekor qilish") {
      orderState.delete(telegramId);
      await bot.sendMessage(chatId, "Buyurtma bekor qilindi.");
    }
  });



  bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const telegramId = query.from?.id;
  const data = query.data;
  if (!telegramId) return;
  const state = orderState.get(telegramId);
  const lang = state?.lang || (await getUserLang(chatId));


   if (data === "cancel_order") {
      orderState.delete(telegramId);
      await bot.sendMessage(chatId, { uz: "Buyurtma bekor qilindi.", ru: "Заказ отменен.", en: "Order cancelled." }[lang]);
      await bot.answerCallbackQuery(query.id);
    }

  if (data.startsWith("do_payment")) {
    const paymentType = data.split("_")[2];

    if (!state || !state.cartItems || !state.deliveryLocation || !state.currentLocation) {
      await bot.sendMessage(chatId, texts.error_fetch[lang]);
      return;
    }

    if (paymentType === "cash") {
      const order = await prisma.order.create({
        data: {
          user: { connect: { telegramId: BigInt(telegramId) } },
          status: "pending",
          totalPrice: state.cartItems.reduce((sum, item) => sum + (item.quantity * (item.medicine?.price || 0)), 0), 
          paymentType: "cash",
           currentLocation: state.currentLocation,
          deliveryLocation: state.deliveryLocation,
          items: {
            create: state.cartItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.medicine?.price || 0
            }))
          }
        },
        include: { items: true }
      });

      await prisma.cartItem.deleteMany({ where: { userId: order.userId } });

      await bot.sendMessage(chatId, texts.order_created[lang]);

      await bot.sendMessage("@your_telegram_channel", `Yangi buyurtma naqtga:
ID: ${order.id}
Holat: ${order.status}`);

      orderState.delete(telegramId);
      await bot.answerCallbackQuery(query.id);
      return;
    }

    let redirectUrl = "";
    if (paymentType === "click") redirectUrl = "https://my.click.uz/pay?order_id=...";
    if (paymentType === "payme") redirectUrl = "https://checkout.paycom.uz/...";
    if (paymentType === "uzum") redirectUrl = "https://pay.uzumbank.uz/pay/...";

    await bot.sendMessage(chatId, `To‘lov sahifasi: <a href=\"${redirectUrl}\">${redirectUrl}</a>`, {
      parse_mode: "HTML"
    });

    orderState.set(telegramId, { ...state, awaiting_payment_gateway: paymentType });
    await bot.answerCallbackQuery(query.id);
  }
});
}
