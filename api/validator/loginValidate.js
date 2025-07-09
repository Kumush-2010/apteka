import Joi from 'joi'

const loginSchema = Joi.object({
    phone: Joi.string().empty('').trim().min(12).max(13).required().messages({
        'string.base': 'Telefon raqam faqat matn boʻlishi kerak!',
        'string.empty': 'Telefon raqam kiritilmagan!',
        'string.min': 'Telefon raqam kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Telefon raqam eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'Telefon raqam majburiy maydon!'
    }),
    password: Joi.string().empty('').min(8).max(20).trim().required().messages({
        'string.base': 'Parol faqat matn boʻlishi kerak!',
        'string.empty': 'Parol kiritilmagan!',
        'string.min': 'Parol kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Parol eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'Parol majburiy maydon!'
    }),
})

export default loginSchema