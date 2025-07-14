import TelegramBot from 'node-telegram-bot-api';
import { BOT_TOKEN } from '../config/config.js';
import { startConversation } from './conversations/start.conversation.js';
import { searchConversation } from './conversations/search.conversation.js';
import { registerProfileConversation } from './conversations/profil.conversation.js';
import { registerLanguageConversation } from './conversations/language.conversation.js';
import { registerContactConversation } from './conversations/contact.conversation.js';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'Botni ishga tushurish!' },
  { command: '/info', description: "Bot haqida ma'lumot" }
]);

startConversation(bot);
searchConversation(bot);
registerProfileConversation(bot);
registerLanguageConversation(bot);
registerContactConversation(bot);

bot.on("polling_error", (error) => {
  console.error("Polling xatosi:", error);
});

console.log('Telegram bot ishga tushdi!');

export default bot;
