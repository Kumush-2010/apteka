import { IS_PRODUCTION, JWT_KEY } from "../config/config.js";
import loginSchema from "../validator/loginValidate.js";
import prisma from '../prisma/setup.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const generateToken = (id, role) => {
    const payload = {
        id,
        role
    };
    return jwt.sign(payload, JWT_KEY, { expiresIn: "1d" });
};

const login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false })
        if (error) {
            return res.status(400).send({
                success: false,
                error: error.details[0].message
            })
        }

        if (!value) {
            return res.status(400).send({
                success: false,
                error: 'Iltomos barcha maydonlarni toʻldiring!'
            })
        }

        const user = await prisma.admin.findUnique({ where: { phone: value.phone } })

        if (!user) {
            return res.status(404).send({
                success: false,
                error: 'Bunday telefon raqamga ega admin topilmadi!'
            })
        }

        const checkPassword = await bcrypt.compare(value.password, user.password)

        if (!checkPassword) {
            return res.status(400).send({
                success: false,
                error: 'Parol xato!'
            })
        }

        const userId = user.id
        const role = user.role
        const token = generateToken(userId, role)

        return res.status(200).send({
            success: true,
            error: false,
            message: 'Kirish muvaffaqiyatli amalga oshirildi!',
            token
        })

    } catch (error) {
        throw error
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: 'Strict'
        })

        return res.status(200).send({
            success: true,
            message: 'Chiqish muvaffaqiyatli amalga oshirildi!'
        })

    } catch (error) {
        throw error
    }
}

export { login, logout }