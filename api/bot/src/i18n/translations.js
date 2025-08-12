const translations = {
  en: {
    welcome: 'Welcome to Pharmacy Bot! 🏥\nPlease select your language:',
    askName: 'Please enter your name:',
    askPhone: 'Please share your phone number:',
    sharePhone: 'Share Phone Number',
    registrationSuccess: 'Registration successful! You can now use the bot.',
    welcomeBack: 'Welcome back to Pharmacy Bot! 🏥',
    mainMenu: 'Main Menu',
    searchMedicine: 'Search Medicine',
    profile: 'Profile',
    changeLanguage: 'Change Language',
    cart: 'Cart',
    contact: 'Contact Us',
    profileInfo: 'Your Profile:\nName: {name}\nPhone: {phone}\nLanguage: {language}',
    updateProfile: 'Update Profile',
    cartEmpty: 'Your cart is empty.',
    cartItems: 'Your cart items:',
    orderNow: 'Place Order',
    askLocation: 'Please share your location:',
    currentLocation: 'Current Location',
    deliveryLocation: 'Delivery Location',
    paymentMethod: 'Select payment method:',
    cash: 'Cash',
    click: 'Click',
    payme: 'Payme',
    uzumBank: 'UzumBank',
    cancel: 'Cancel',
    orderCancelled: 'Order cancelled.',
    orderSuccess: 'Order placed successfully!',
    searchPrompt: 'Enter medicine name to search:',
    noResults: 'No medicine found with this name.',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove from Cart',
    added: 'Added to cart',
    removed: 'Removed from cart',
    orderDetails: 'Order Details:\nTotal: {total} sum\nDelivery: {delivery} sum\nTotal with delivery: {totalWithDelivery} sum',
    itemList: '• {name} - {quantity} pcs - {price} sum',
    back: 'Back',
    contactInfo: 'Contact Information:\nPhone: +998 xx xxx xx xx\nEmail: info@pharmacybot.com\nWorking hours: 9:00-18:00',
    profileUpdated: 'Profile updated successfully!',
    updateName: 'Update Name',
    updatePhone: 'Update Phone',
    medicineDetails: 'Name: {name}\nMade in: {made}\nOne plate: {one_plate}\nOne box: {one_box}\nPrice (plate): {plate_price} sum\nPrice (box): {box_price} sum\nGram: {gram}',
  },
  ru: {
    welcome: 'Добро пожаловать в Аптечный Бот! 🏥\nПожалуйста, выберите язык:',
    askName: 'Пожалуйста, введите ваше имя:',
    askPhone: 'Пожалуйста, поделитесь вашим номером телефона:',
    sharePhone: 'Поделиться номером телефона',
    registrationSuccess: 'Регистрация успешна! Теперь вы можете пользоваться ботом.',
    welcomeBack: 'С возвращением в Аптечный Бот! 🏥',
    mainMenu: 'Главное меню',
    searchMedicine: 'Поиск лекарства',
    profile: 'Профиль',
    changeLanguage: 'Сменить язык',
    cart: 'Корзина',
    contact: 'Связаться с нами',
    profileInfo: 'Ваш профиль:\nИмя: {name}\nТелефон: {phone}\nЯзык: {language}',
    updateProfile: 'Обновить профиль',
    cartEmpty: 'Ваша корзина пуста.',
    cartItems: 'Товары в вашей корзине:',
    orderNow: 'Оформить заказ',
    askLocation: 'Пожалуйста, поделитесь своим местоположением:',
    currentLocation: 'Текущее местоположение',
    deliveryLocation: 'Местоположение доставки',
    paymentMethod: 'Выберите способ оплаты:',
    cash: 'Наличные',
    click: 'Click',
    payme: 'Payme',
    uzumBank: 'UzumBank',
    cancel: 'Отмена',
    orderCancelled: 'Заказ отменен.',
    orderSuccess: 'Заказ успешно оформлен!',
    searchPrompt: 'Введите название лекарства для поиска:',
    noResults: 'Лекарство с таким названием не найдено.',
    addToCart: 'Добавить в корзину',
    removeFromCart: 'Удалить из корзины',
    added: 'Добавлено в корзину',
    removed: 'Удалено из корзины',
    orderDetails: 'Детали заказа:\nИтого: {total} сум\nДоставка: {delivery} сум\nИтого с доставкой: {totalWithDelivery} сум',
    itemList: '• {name} - {quantity} шт - {price} сум',
    back: 'Назад',
    contactInfo: 'Контактная информация:\nТелефон: +998 xx xxx xx xx\nEmail: info@pharmacybot.com\nЧасы работы: 9:00-18:00',
    profileUpdated: 'Профиль успешно обновлен!',
    updateName: 'Обновить имя',
    updatePhone: 'Обновить телефон',
    medicineDetails: 'Название: {name}\nПроизведено: {made}\nОдна пластина: {one_plate}\nОдна коробка: {one_box}\nЦена (пластина): {plate_price} сум\nЦена (коробка): {box_price} сум\nГрамм: {gram}',
  },
  uz: {
    welcome: 'Dorixona Botiga xush kelibsiz! 🏥\nIltimos, tilni tanlang:',
    askName: 'Iltimos, ismingizni kiriting:',
    askPhone: 'Iltimos, telefon raqamingizni ulashing:',
    sharePhone: 'Telefon raqamni ulashish',
    registrationSuccess: 'Ro\'yxatdan o\'tish muvaffaqiyatli! Endi botdan foydalanishingiz mumkin.',
    welcomeBack: 'Dorixona Botiga qayta xush kelibsiz! 🏥',
    mainMenu: 'Asosiy menyu',
    searchMedicine: 'Dori qidirish',
    profile: 'Profil',
    changeLanguage: 'Tilni o\'zgartirish',
    cart: 'Savat',
    contact: 'Bog\'lanish',
    profileInfo: 'Sizning profilingiz:\nIsm: {name}\nTelefon: {phone}\nTil: {language}',
    updateProfile: 'Profilni yangilash',
    cartEmpty: 'Sizning savatingiz bo\'sh.',
    cartItems: 'Savatingizdagi mahsulotlar:',
    orderNow: 'Buyurtma berish',
    askLocation: 'Iltimos, joylashuvingizni ulashing:',
    currentLocation: 'Hozirgi joy',
    deliveryLocation: 'Yetkazib berish joyi',
    paymentMethod: 'To\'lov usulini tanlang:',
    cash: 'Naqd pul',
    click: 'Click',
    payme: 'Payme',
    uzumBank: 'UzumBank',
    cancel: 'Bekor qilish',
    orderCancelled: 'Buyurtma bekor qilindi.',
    orderSuccess: 'Buyurtma muvaffaqiyatli joylashtirildi!',
    searchPrompt: 'Qidirish uchun dori nomini kiriting:',
    noResults: 'Bu nom bilan dori topilmadi.',
    addToCart: 'Savatga qo\'shish',
    removeFromCart: 'Savatdan olib tashlash',
    added: 'Savatga qo\'shildi',
    removed: 'Savatdan olib tashlandi',
    orderDetails: 'Buyurtma tafsilotlari:\nJami: {total} sum\nYetkazib berish: {delivery} sum\nYetkazib berish bilan jami: {totalWithDelivery} sum',
    itemList: '• {name} - {quantity} dona - {price} sum',
    back: 'Orqaga',
    contactInfo: 'Bog\'lanish ma\'lumotlari:\nTelefon: +998 xx xxx xx xx\nEmail: info@pharmacybot.com\nIsh vaqti: 9:00-18:00',
    profileUpdated: 'Profil muvaffaqiyatli yangilandi!',
    updateName: 'Ismni yangilash',
    updatePhone: 'Telefon raqamni yangilash',
    medicineDetails: 'Nomi: {name}\nIshlab chiqarilgan: {made}\nBitta plastinka: {one_plate}\nBitta quti: {one_box}\nNarx (plastinka): {plate_price} sum\nNarx (quti): {box_price} sum\nGramm: {gram}',
  }
};

/**
 * Get translation for the specified key in the user's language
 * @param {string} key - Translation key
 * @param {string} language - User language (en, ru, or uz)
 * @param {Object} variables - Variables to replace in the translation
 * @returns {string} - Translated text
 */
function translate(key, language = 'en', variables = {}) {
  // Default to English if language not supported
  if (!['en', 'ru', 'uz'].includes(language)) {
    language = 'en';
  }

  let text = translations[language][key] || translations.en[key] || key;
  
  // Replace variables in the text (e.g., {name} with the actual name)
  if (variables && typeof variables === 'object') {
    Object.keys(variables).forEach(variable => {
      text = text.replace(new RegExp(`{${variable}}`, 'g'), variables[variable]);
    });
  }

  return text;
}

export {
  translate,
  languages: ['en', 'ru', 'uz'],
  languageNames: {
    en: 'English 🇬🇧',
    ru: 'Русский 🇷🇺',
    uz: 'O\'zbek 🇺🇿'
  }
};