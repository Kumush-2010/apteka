import Joi from 'joi'

const createSupplierSchema = Joi.object({
    name: Joi.string().empty('').min(3).max(255).required().messages({
        'string.base': 'Ism faqat matn boʻlishi kerak!',
        'string.empty': 'Ism kiritilmadi!',
        'string.min': 'Ism kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Ism eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'Ism majburiy maydon!'
    }),
    phone: Joi.string().empty().trim().min(12).max(13).required().messages({
        'string.base': 'Telefon raqam faqat matn boʻlishi kerak!',
        'string.empty': 'Telefon kiritilmadi!',
        'string.min': 'Telefon raqam kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Telefon raqam eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'Telefon raqam majburiy maydon!'
    }),
    password: Joi.string().empty().min(8).max(20).trim().required().messages({
        'string.base': 'Parol faqat matn boʻlishi kerak!',
        'string.empty': 'Parol kiritilmadi!',
        'string.min': 'Parol kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Parol eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'Parol majburiy maydon!'
    }),
    role: Joi.string().empty().valid('supplier').trim().required().messages({
        'string.base': 'Role faqat matn boʻlishi kerak!',
        'string.empty': 'Role kiritilmadi!',
        'any.only': 'Role faqat supplier bo‘lishi mumkin!',
        'any.required': 'Role majburiy maydon!'
    })
})

const updateSupplierSchema = Joi.object({
    name: Joi.string().min(3).max(255).messages({
        'string.base': 'Ism faqat matn boʻlishi kerak',
        'string.min': 'Ism kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Ism eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
    }),
    phone: Joi.string().trim().min(12).max(13).messages({
        'string.base': 'Telefon raqam faqat matn boʻlishi kerak',
        'string.min': 'Telefon raqam kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Telefon raqam eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
    }),
    role: Joi.string().valid('admin', 'superAdmin').trim().messages({
        'string.base': 'Role faqat matn boʻlishi kerak',
        'any.only': 'Role faqat admin yoki superAdmin bo‘lishi mumkin'
    })
})

export { createSupplierSchema, updateSupplierSchema }