import { translate } from '../i18n/translations';
import { backKeyboard } from '../utils/keyboard';

/**
 * Handle contact menu
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} user - User object
 */
async function handleContact(bot, msg, user) {
  const chatId = msg.chat.id;
  
  try {
    // Show contact information
    bot.sendMessage(
      chatId,
      translate('contactInfo', user.language),
      backKeyboard(user.language)
    );
  } catch (error) {
    console.error('Error in handleContact:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

export {
  handleContact
};