import { translate, languageNames } from '../i18n/translations';
import { profileKeyboard, mainMenuKeyboard, phoneKeyboard } from '../utils/keyboard';
import UserModel from '../models/user';

/**
 * Handle profile menu
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} user - User object
 */
async function handleProfile(bot, msg, user) {
  const chatId = msg.chat.id;
  
  try {
    // Show profile info
    const languageName = languageNames[user.language] || user.language;
    
    bot.sendMessage(
      chatId,
      translate('profileInfo', user.language, {
        name: user.name,
        phone: user.phone,
        language: languageName
      }),
      profileKeyboard(user.language)
    );
  } catch (error) {
    console.error('Error in handleProfile:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle profile update
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handleUpdateProfile(bot, msg, userStates, user) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    // Set update state
    userStates[userId] = {
      ...userStates[userId],
      updateStep: 'name'
    };
    
    // Ask for new name
    bot.sendMessage(chatId, translate('askName', user.language));
  } catch (error) {
    console.error('Error in handleUpdateProfile:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle update name input
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handleUpdateNameInput(bot, msg, userStates, user) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const newName = msg.text;
  
  try {
    // Update state
    userStates[userId] = {
      ...userStates[userId],
      updateName: newName,
      updateStep: 'phone'
    };
    
    // Ask for phone
    bot.sendMessage(
      chatId,
      translate('askPhone', user.language),
      phoneKeyboard(user.language)
    );
  } catch (error) {
    console.error('Error in handleUpdateNameInput:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle update phone input
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handleUpdatePhoneInput(bot, msg, userStates, user) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const newPhone = msg.contact ? msg.contact.phone_number : msg.text;
  
  try {
    const newName = userStates[userId].updateName;
    
    // Update user in database
    await UserModel.update(userId, {
      name: newName,
      phone: newPhone
    });
    
    // Send success message
    bot.sendMessage(
      chatId,
      translate('profileUpdated', user.language),
      mainMenuKeyboard(user.language)
    );
    
    // Clear update state
    delete userStates[userId];
  } catch (error) {
    console.error('Error in handleUpdatePhoneInput:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

export {
  handleProfile,
  handleUpdateProfile,
  handleUpdateNameInput,
  handleUpdatePhoneInput
};