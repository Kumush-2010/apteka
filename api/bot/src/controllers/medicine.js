import { translate } from '../i18n/translations';
import { backKeyboard, searchResultsKeyboard, medicineDetailKeyboard } from '../utils/keyboard';
import MedicineModel from '../models/medicine';
import CartModel from '../models/cart';

/**
 * Handle medicine search
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handleSearchMedicine(bot, msg, userStates, user) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    // Set search state
    userStates[userId] = {
      ...userStates[userId],
      searchStep: 'query'
    };
    
    // Ask for medicine name
    bot.sendMessage(
      chatId,
      translate('searchPrompt', user.language),
      backKeyboard(user.language)
    );
  } catch (error) {
    console.error('Error in handleSearchMedicine:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle medicine search query
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handleSearchQuery(bot, msg, userStates, user) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const query = msg.text;
  
  try {
    // Search medicines
    const medicines = await MedicineModel.searchByName(query, user.language);
    
    if (medicines.length === 0) {
      // No results
      bot.sendMessage(
        chatId,
        translate('noResults', user.language),
        backKeyboard(user.language)
      );
    } else {
      // Show search results
      bot.sendMessage(
        chatId,
        `${medicines.length} ${medicines.length === 1 ? 'result' : 'results'} found:`,
        searchResultsKeyboard(medicines, user.language)
      );
    }
    
    // Clear search state
    delete userStates[userId].searchStep;
  } catch (error) {
    console.error('Error in handleSearchQuery:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle medicine selection
 * @param {Object} bot - Telegram bot instance
 * @param {Object} query - Callback query object
 * @param {Object} user - User object
 */
async function handleMedicineSelection(bot, query, user) {
  const chatId = query.message.chat.id;
  const medicineId = query.data.split(':')[1];
  
  try {
    // Get medicine details
    const medicine = await MedicineModel.getById(medicineId);
    
    if (!medicine) {
      bot.answerCallbackQuery(query.id, { text: 'Medicine not found' });
      return;
    }
    
    // Show medicine details
    const name = medicine[`${user.language}_name`] || medicine.en_name;
    bot.sendMessage(
      chatId,
      translate('medicineDetails', user.language, {
        name,
        made: medicine.made,
        one_plate: medicine.one_plate,
        one_box: medicine.one_box,
        plate_price: medicine.one_plate_price,
        box_price: medicine.one_box_price,
        gram: medicine.gram
      }),
      medicineDetailKeyboard(user.language, medicineId)
    );
    
    // Answer callback query
    bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Error in handleMedicineSelection:', error);
    bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
  }
}

/**
 * Handle add to cart
 * @param {Object} bot - Telegram bot instance
 * @param {Object} query - Callback query object
 * @param {Object} user - User object
 */
async function handleAddToCart(bot, query, user) {
  const chatId = query.message.chat.id;
  const medicineId = query.data.split(':')[1];
  
  try {
    // Get medicine details
    const medicine = await MedicineModel.getById(medicineId);
    
    if (!medicine) {
      bot.answerCallbackQuery(query.id, { text: 'Medicine not found' });
      return;
    }
    
    // Add to cart
    const name = medicine[`${user.language}_name`] || medicine.en_name;
    await CartModel.addToCart(
      user.id,
      medicineId,
      name,
      medicine.one_plate_price
    );
    
    // Answer callback query
    bot.answerCallbackQuery(query.id, {
      text: translate('added', user.language)
    });
  } catch (error) {
    console.error('Error in handleAddToCart:', error);
    bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
  }
}

export {
  handleSearchMedicine,
  handleSearchQuery,
  handleMedicineSelection,
  handleAddToCart
};