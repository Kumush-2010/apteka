import Joi from 'joi'

export const imageSchema = Joi.object({
    originalname: Joi.string().regex(/\.(jpg|jpeg|png|svg|avf|webp|)$/i).required().messages({
        "string.pattern.base": "Rasm nomi noto'g'ri formatda!",
        "any.required": "Rasm nomi talab qilinadi!"
    }),
    mimetype: Joi.string().valid("image/jpeg", "image/jpg", "image/png", "image/svg", "image/avf", "image/webp").required().messages({
        "any.required": "Rasm formati talab qilinadi!"
    }),
    size: Joi.number().max(5 * 1024 * 1024).required().messages({
        "number.max": "Rasm hajmi 5 mb dan oshmasligi kerak!"
    }),
    fieldname: Joi.string().valid('image').required().messages({
        "any.required": "Rasm yuklanmadi!"
    }),
    encoding: Joi.string(),

    filename: Joi.string(),

    buffer: Joi.required().messages({
        "any.required": "Rasm yuklanmadi!"
    }),

    path: Joi.string()
})