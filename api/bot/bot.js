import TelegramBot from 'node-telegram-bot-api';
import { BOT_TOKEN } from '../config/config.js';
import { startConversation } from './conversations/start.conversation.js';
import { searchConversation } from './conversations/search.conversation.js';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'Botni ishga tushurish!' },
  { command: '/info', description: "Bot haqida ma'lumot" }
]);

startConversation(bot);
searchConversation(bot);

bot.on("polling_error", (error) => {
  console.error("Polling xatosi:", error);
});

console.log('Telegram bot ishga tushdi!');

export default bot;
