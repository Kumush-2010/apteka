import { translate, languageNames } from '../i18n/translations';

/**
 * Create language selection keyboard
 * @returns {Object} - Telegram keyboard markup
 */
function languageKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: languageNames.en }, { text: languageNames.ru }, { text: languageNames.uz }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
}

/**
 * Create phone sharing keyboard
 * @param {string} language - User language
 * @returns {Object} - Telegram keyboard markup
 */
function phoneKeyboard(language) {
  return {
    reply_markup: {
      keyboard: [
        [{ text: translate('sharePhone', language), request_contact: true }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
}

/**
 * Create main menu keyboard
 * @param {string} language - User language
 * @returns {Object} - Telegram keyboard markup
 */
function mainMenuKeyboard(language) {
  return {
    reply_markup: {
      keyboard: [
        [{ text: translate('searchMedicine', language) }, { text: translate('profile', language) }],
        [{ text: translate('changeLanguage', language) }, { text: translate('cart', language) }],
        [{ text: translate('contact', language) }]
      ],
      resize_keyboard: true
    }
  };
}

/**
 * Create profile menu keyboard
 * @param {string} language - User language
 * @returns {Object} - Telegram keyboard markup
 */
function profileKeyboard(language) {
  return {
    reply_markup: {
      keyboard: [
        [{ text: translate('updateProfile', language) }, { text: translate('cart', language) }],
        [{ text: translate('back', language) }]
      ],
      resize_keyboard: true
    }
  };
}

/**
 * Create cart keyboard
 * @param {string} language - User language
 * @param {boolean} isEmpty - Whether cart is empty
 * @returns {Object} - Telegram keyboard markup
 */
function cartKeyboard(language, isEmpty = true) {
  const keyboard = [];
  
  if (!isEmpty) {
    keyboard.push([{ text: translate('orderNow', language) }]);
  }
  
  keyboard.push([{ text: translate('back', language) }]);
  
  return {
    reply_markup: {
      keyboard,
      resize_keyboard: true
    }
  };
}

/**
 * Create location keyboard
 * @param {string} language - User language
 * @returns {Object} - Telegram keyboard markup
 */
function locationKeyboard(language) {
  return {
    reply_markup: {
      keyboard: [
        [
          { text: translate('currentLocation', language), request_location: true },
          { text: translate('deliveryLocation', language) }
        ],
        [{ text: translate('cancel', language) }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
}

/**
 * Create payment method keyboard
 * @param {string} language - User language
 * @returns {Object} - Telegram keyboard markup
 */
function paymentMethodKeyboard(language) {
  return {
    reply_markup: {
      keyboard: [
        [{ text: translate('cash', language) }, { text: translate('click', language) }],
        [{ text: translate('payme', language) }, { text: translate('uzumBank', language) }],
        [{ text: translate('cancel', language) }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };
}

/**
 * Create back button keyboard
 * @param {string} language - User language
 * @returns {Object} - Telegram keyboard markup
 */
function backKeyboard(language) {
  return {
    reply_markup: {
      keyboard: [
        [{ text: translate('back', language) }]
      ],
      resize_keyboard: true
    }
  };
}

/**
 * Create medicine detail keyboard with add to cart button
 * @param {string} language - User language
 * @param {number} medicineId - Medicine ID
 * @returns {Object} - Telegram keyboard markup
 */
function medicineDetailKeyboard(language, medicineId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: translate('addToCart', language), callback_data: `add_to_cart:${medicineId}` }],
        [{ text: translate('back', language), callback_data: 'back_to_search' }]
      ]
    }
  };
}

/**
 * Create inline keyboard for search results
 * @param {Array} medicines - List of medicines
 * @param {string} language - User language
 * @returns {Object} - Telegram inline keyboard markup
 */
function searchResultsKeyboard(medicines, language) {
  const keyboard = [];
  
  medicines.forEach((medicine, index) => {
    const name = medicine[`${language}_name`] || medicine.en_name;
    keyboard.push([
      { text: `${index + 1}. ${name}`, callback_data: `medicine:${medicine.id}` }
    ]);
  });
  
  return {
    reply_markup: {
      inline_keyboard: keyboard
    }
  };
}

/**
 * Create cart item keyboard
 * @param {Array} items - Cart items
 * @param {string} language - User language
 * @returns {Object} - Telegram inline keyboard markup
 */
function cartItemsKeyboard(items, language) {
  const keyboard = [];
  
  items.forEach((item) => {
    keyboard.push([
      { 
        text: `❌ ${item.name} (${item.quantity})`, 
        callback_data: `remove_from_cart:${item.id}` 
      }
    ]);
  });
  
  return {
    reply_markup: {
      inline_keyboard: keyboard
    }
  };
}

export {
  languageKeyboard,
  phoneKeyboard,
  mainMenuKeyboard,
  profileKeyboard,
  cartKeyboard,
  locationKeyboard,
  paymentMethodKeyboard,
  backKeyboard,
  medicineDetailKeyboard,
  searchResultsKeyboard,
  cartItemsKeyboard
};