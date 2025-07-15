
import Joi from "joi";

const updatePasswordSchema = Joi.object({
    password: Joi.string().empty('').min(8).max(20).trim().required().messages({
        'string.base': 'Parol faqat matn boʻlishi kerak!',
        'string.empty': 'Parol kiritilmagan!',
        'string.min': 'Parol kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Parol eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'Parol majburiy maydon!'
    }),
})

export default updatePasswordSchema