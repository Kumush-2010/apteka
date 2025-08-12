import { translate } from '../i18n/translations';
import { languageKeyboard, phoneKeyboard, mainMenuKeyboard } from '../utils/keyboard';
import UserModel from '../models/user';

/**
 * Handle /start command
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 */
async function handleStart(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    // Check if user exists
    const user = await UserModel.findByTelegramId(userId);
    
    if (user) {
      // User exists, welcome back
      bot.sendMessage(
        chatId,
        translate('welcomeBack', user.language),
        mainMenuKeyboard(user.language)
      );
    } else {
      // New user, start registration
      bot.sendMessage(
        chatId,
        translate('welcome'),
        languageKeyboard()
      );
    }
  } catch (error) {
    console.error('Error in handleStart:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle language selection
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {string} selectedLanguage - Selected language code
 */
async function handleLanguageSelection(bot, msg, userStates, selectedLanguage) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    // Set language in user state
    userStates[userId] = {
      ...userStates[userId],
      language: selectedLanguage,
      registrationStep: 'name'
    };
    
    // Ask for name
    bot.sendMessage(chatId, translate('askName', selectedLanguage));
  } catch (error) {
    console.error('Error in handleLanguageSelection:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle name input
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 */
async function handleNameInput(bot, msg, userStates) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const name = msg.text;
  
  try {
    // Set name in user state
    userStates[userId] = {
      ...userStates[userId],
      name,
      registrationStep: 'phone'
    };
    
    // Ask for phone
    const language = userStates[userId].language;
    bot.sendMessage(
      chatId,
      translate('askPhone', language),
      phoneKeyboard(language)
    );
  } catch (error) {
    console.error('Error in handleNameInput:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle phone input
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 */
async function handlePhoneInput(bot, msg, userStates) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const phone = msg.contact ? msg.contact.phone_number : msg.text;
  
  try {
    const userData = userStates[userId];
    
    // Create user in database
    await UserModel.create({
      telegramId: userId,
      name: userData.name,
      phone,
      language: userData.language
    });
    
    // Send success message
    bot.sendMessage(
      chatId,
      translate('registrationSuccess', userData.language),
      mainMenuKeyboard(userData.language)
    );
    
    // Clear registration state
    delete userStates[userId];
  } catch (error) {
    console.error('Error in handlePhoneInput:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Update user language
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {string} language - New language
 */
async function updateLanguage(bot, msg, language) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    // Update user language in database
    await UserModel.update(userId, { language });
    
    // Send success message and show main menu
    bot.sendMessage(
      chatId,
      translate('profileUpdated', language),
      mainMenuKeyboard(language)
    );
  } catch (error) {
    console.error('Error in updateLanguage:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

export {
  handleStart,
  handleLanguageSelection,
  handleNameInput,
  handlePhoneInput,
  updateLanguage
};