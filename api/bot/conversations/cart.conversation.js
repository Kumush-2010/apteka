import prisma from "../../prisma/setup.js";
import bot from "../bot.js";

async function getOrCreateUser(telegramId) {
    const tid = BigInt(telegramId)
    return await prisma.user.upsert({
        where: { telegramId: tid },
        update: {},
        create: { telegramId: tid }
    })
}

    async function  getCart(telegramId) {
        const tid = BigInt(telegramId)
        const user = await prisma.user.findUnique({
            where: { telegramId: tid},
            include: { cartItems: true }
        })
        if (!user) return []
        return user.cartItems
    }
    
    export function getCartItems(bot) {
        const getsCart = /^\/?(Savat|Basket|Корзина)$/i;
        bot.onText(getsCart, async (msg) => {
            const chatId = msg.chat.id;
            const telegramId = msg.from?.id;
            if (!telegramId) return;
    
            try {
                const items = await getCart(telegramId);
                if (items.length === 0) {
                    bot.sendMessage(chatId, "Savat bo'sh.");
                    return;
                }
                const lines = items.map((it) => `${it.name} - ${it.quantity}`)
            bot.sendMessage(chatId, `${infor}\n${lines.join('\n')}`);
            } catch (err) {
                console.error("Savatni olishda xato:", err);
                bot.sendMessage(chatId, "Savatni olishda xato yuz berdi.");
            }
        })

}

function infor(lang) {
    const langCart = {
        uz: "Savatdagi mahsulotlar:",
        en: "",
        ru: ""
    }
    return langCart[lang]
}

