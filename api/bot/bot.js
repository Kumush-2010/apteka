import TelegramBot from 'node-telegram-bot-api'
import { BOT_TOKEN } from '../config/config.js'

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

bot.setMyCommands([
    {command: '/start', description: 'Botni ishga tushurish!'},
    {command: '/info', description: "Bot haqida ma'lumot"}
])

bot.on("message", async msg => {
    const chatId = msg.chat.id
    console.log(chatId);
    
    const text = msg.text
    console.log(text);
    
    const name = msg.from.username

    if (text === '/start') {
        await bot.sendMessage(chatId, `Assalomu alaykum hurmatli @${name}, Botimizga xush kelibbsiz!`)
    }
})

console.log('Telegram bot ishga tushdi!');

export default bot