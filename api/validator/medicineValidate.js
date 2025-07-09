import Joi from "joi";

const createMedicineSchema = Joi.object({
    uz_name: Joi.string().min(3).max(255).empty('').required().messages({
        'string.base': 'Ism faqat matn boʻlishi kerak!',
        'string.empty': 'Uzb Ism kiritilmagan!',
        'string.min': 'Ism kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Ism eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'Ism majburiy maydon!'
    }),
    ru_name: Joi.string().min(3).max(255).empty('').required().messages({
        'string.base': 'Rus Ism faqat matn boʻlishi kerak!',
        'string.empty': 'Rus Ism kiritilmagan!',
        'string.min': 'Rus Ism kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Rus Ism eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'Rus Ism majburiy maydon!'
    }),
    en_name: Joi.string().min(3).max(255).empty('').required().messages({
        'string.base': 'En Ism faqat matn boʻlishi kerak!',
        'string.empty': 'En Ism kiritilmagan!',
        'string.min': 'En Ism kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'En Ism eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
        'any.required': 'En Ism majburiy maydon!'
    }),
    made: Joi.string().empty('').required().messages({
        'string.base': 'Ishlab chiqaruvchini faqat matnda kiriting!',
        'string.empty': 'Ishlab chiqaruvchi kiritilmagan!',
        'any.required': 'Ishlab chiqaruvchini kiritish talab qilinadi!'
    }),
    one_plate: Joi.string().empty('').required().messages({
        'string.base': 'Bitta diskni faqat matnda kiriting!',
        'string.empty': 'Bitta disk kiritilmagan!',
        'any.required': 'Bitta disk kiritish talab qilinadi!'
    }),
    one_box: Joi.string().empty('').required().messages({
        'string.base': 'Bitta qutini faqat matnda kiriting!',
        'string.empty': 'Bitta quti bo‘sh bo‘lmasligi kerak!',
        'any.required': 'Bitta qutini kiritish talab qilinadi!'
    }),
    one_plate_price: Joi.number().integer().empty('').required().messages({
        'number.base': 'Bitta disk narxi raqam boʻlishi kerak!',
        'number.empty': 'Bitta disk narxi bo‘sh bo‘lmasligi kerak!',
        'any.required': 'Bitta diskni narxini kiritish talb qilinadi!'
    }),
    one_box_price: Joi.number().integer().empty('').required().messages({
        'number.base': 'Bitta quti narxi raqam boʻlishi kerak!',
        'number.empty': 'Bitta quti narxi raqam bo‘sh bo‘lmasligi kerak!',
        'any.required': 'Bitta quti narxini kiritish talb qilinadi!'
    }),
    warehouse: Joi.number().integer().empty('').required().messages({
        'number.base': 'Omborda qancha ekanligi raqam boʻlishi kerak!',
        'number.empty': 'Omborda qancha ekanligi bo‘sh bo‘lmasligi kerak!',
        'any.required': 'Omborda qancha ekanligini kiritish talb qilinadi!'
    }),
    pharmacyId: Joi.required().messages({
        'any.required': 'Dorixona Idsi talab qilinadi!'
    }),
})

const updateMedicineSchema = Joi.object({
    uz_name: Joi.string().min(3).max(255).messages({
        'string.base': 'Ism faqat matn boʻlishi kerak!',
        'string.min': 'Ism kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Ism eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
    }),
    ru_name: Joi.string().min(3).max(255).messages({
        'string.base': 'Rus Ism faqat matn boʻlishi kerak!',
        'string.min': 'Rus Ism kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'Rus Ism eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
    }),
    en_name: Joi.string().min(3).max(255).messages({
        'string.base': 'En Ism faqat matn boʻlishi kerak!',
        'string.min': 'En Ism kamida {#limit} ta belgidan iborat boʻlishi kerak!',
        'string.max': 'En Ism eng koʻpi bilan {#limit} ta belgidan iborat boʻlishi kerak!',
    }),
    made: Joi.string().messages({
        'string.base': 'Ishlab chiqaruvchini faqat matnda kiriting!',
    }),
    one_plate: Joi.string().messages({
        'string.base': 'Bitta diskni faqat matnda kiriting!',
    }),
    one_box: Joi.string().messages({
        'string.base': 'Bitta qutini faqat matnda kiriting!',
    }),
    one_plate_price: Joi.number().integer().messages({
        'number.base': 'Bitta disk narxi raqam boʻlishi kerak!',
    }),
    one_box_price: Joi.number().integer().messages({
        'number.base': 'Bitta quti narxi raqam boʻlishi kerak!',
    }),
    warehouse: Joi.number().integer().messages({
        'number.base': 'Omborda qancha ekanligi raqam boʻlishi kerak!',
    }),
    pharmacyId: Joi.required().messages({
        'any.required': 'Dorixona Idsi talab qilinadi!'
    }),
})
export { createMedicineSchema, updateMedicineSchema }