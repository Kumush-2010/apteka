import TelegramBot from 'node-telegram-bot-api'
import { BOT_TOKEN } from '../config/config.js'
import { start } from './conversations/start.conversation.js'

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

bot.setMyCommands([
    {command: '/start', description: 'Botni ishga tushurish!'},
    {command: '/info', description: "Bot haqida ma'lumot"}
])

bot.on("message", async msg => {
    const chatId = msg.chat.id
    console.log(chatId);
    
    start(msg)
})

console.log('Telegram bot ishga tushdi!');

export default bot