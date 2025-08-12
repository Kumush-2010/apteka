import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { translate, languageNames } from './i18n/translations';
import { mainMenuKeyboard, languageKeyboard } from './utils/keyboard';
import UserModel from './models/user';

// Controllers
import * as RegistrationController from './controllers/registration';
import * as ProfileController from './controllers/profile';
import * as MedicineController from './controllers/medicine';
import * as CartController from './controllers/cart';
import * as ContactController from './controllers/contact';

// Create a bot instance
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// User states (in-memory storage for user's current actions)
const userStates = {};

// Command handlers
bot.onText(/\/start/, async (msg) => {
  await RegistrationController.handleStart(bot, msg);
});

// Message handler
bot.on('message', async (msg) => {
  if (msg.text?.startsWith('/')) return; // Skip other commands
  
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const text = msg.text || '';
  
  try {
    // Check if user exists
    const user = await UserModel.findByTelegramId(userId);
    
    if (!user) {
      // Handle registration flow
      handleRegistrationFlow(bot, msg, userStates);
    } else {
      // Handle authenticated user
      handleAuthenticatedUser(bot, msg, userStates, user);
    }
  } catch (error) {
    console.error('Error in message handler:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
});

// Callback query handler (for inline buttons)
bot.on('callback_query', async (query) => {
  const userId = query.from.id;
  
  try {
    // Check if user exists
    const user = await UserModel.findByTelegramId(userId);
    
    if (!user) {
      bot.answerCallbackQuery(query.id, { text: 'Please start the bot first' });
      return;
    }
    
    // Handle callback data
    const data = query.data;
    
    if (data.startsWith('medicine:')) {
      await MedicineController.handleMedicineSelection(bot, query, user);
    } else if (data.startsWith('add_to_cart:')) {
      await MedicineController.handleAddToCart(bot, query, user);
    } else if (data.startsWith('remove_from_cart:')) {
      await CartController.handleRemoveFromCart(bot, query, user);
    } else if (data === 'back_to_search') {
      // Handle back to search
      bot.deleteMessage(query.message.chat.id, query.message.message_id);
      bot.answerCallbackQuery(query.id);
    }
  } catch (error) {
    console.error('Error in callback query handler:', error);
    bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
  }
});

/**
 * Handle registration flow
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 */
async function handleRegistrationFlow(bot, msg, userStates) {
  const userId = msg.from.id;
  const userState = userStates[userId];
  
  // Check if language selection is in progress
  if (msg.text && Object.values(languageNames).includes(msg.text)) {
    // Extract language code from selection
    const selectedLanguage = Object.keys(languageNames).find(
      key => languageNames[key] === msg.text
    ) || 'en';
    
    await RegistrationController.handleLanguageSelection(bot, msg, userStates, selectedLanguage);
    return;
  }
  
  // Check registration step
  if (userState) {
    switch (userState.registrationStep) {
      case 'name':
        await RegistrationController.handleNameInput(bot, msg, userStates);
        break;
        
      case 'phone':
        await RegistrationController.handlePhoneInput(bot, msg, userStates);
        break;
    }
  }
}

/**
 * Handle authenticated user messages
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handleAuthenticatedUser(bot, msg, userStates, user) {
  const userId = msg.from.id;
  const text = msg.text || '';
  const userState = userStates[userId] || {};
  
  // Handle profile update flow
  if (userState.updateStep === 'name') {
    await ProfileController.handleUpdateNameInput(bot, msg, userStates, user);
    return;
  } else if (userState.updateStep === 'phone') {
    await ProfileController.handleUpdatePhoneInput(bot, msg, userStates, user);
    return;
  }
  
  // Handle search flow
  if (userState.searchStep === 'query') {
    await MedicineController.handleSearchQuery(bot, msg, userStates, user);
    return;
  }
  
  // Handle order flow
  if (userState.orderStep === 'location') {
    await CartController.handleLocationInput(bot, msg, userStates, user);
    return;
  } else if (userState.orderStep === 'payment') {
    await CartController.handlePaymentMethod(bot, msg, userStates, user);
    return;
  }
  
  // Handle main menu commands
  switch (text) {
    case translate('searchMedicine', user.language):
      await MedicineController.handleSearchMedicine(bot, msg, userStates, user);
      break;
      
    case translate('profile', user.language):
      await ProfileController.handleProfile(bot, msg, user);
      break;
      
    case translate('changeLanguage', user.language):
      bot.sendMessage(
        msg.chat.id,
        translate('welcome', user.language),
        languageKeyboard()
      );
      break;
      
    case translate('cart', user.language):
      await CartController.handleCart(bot, msg, user);
      break;
      
    case translate('contact', user.language):
      await ContactController.handleContact(bot, msg, user);
      break;
      
    case translate('updateProfile', user.language):
      await ProfileController.handleUpdateProfile(bot, msg, userStates, user);
      break;
      
    case translate('orderNow', user.language):
      await CartController.handlePlaceOrder(bot, msg, userStates, user);
      break;
      
    case translate('back', user.language):
      bot.sendMessage(
        msg.chat.id,
        translate('mainMenu', user.language),
        mainMenuKeyboard(user.language)
      );
      break;
      
    // Handle language selection for existing users
    case languageNames.en:
    case languageNames.ru:
    case languageNames.uz:
      const selectedLanguage = Object.keys(languageNames).find(
        key => languageNames[key] === text
      ) || 'en';
      await RegistrationController.updateLanguage(bot, msg, selectedLanguage);
      break;
  }
}

console.log('Bot is running...');