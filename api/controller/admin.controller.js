import prisma from '../prisma/setup.js'
import { adminCreateSchema, adminUpdateSchema } from '../validator/adminValidate.js'
import updatePasswordSchema from '../validator/passwordValidate.js'
import bcrypt from 'bcrypt'

const adminCreate = async (req, res) => {
    try {
        const { error, value } = adminCreateSchema.validate(req.body, { abortEarly: false })
        if (error) {
            return res.status(400).send({
                success: false,
                error: error.details[0].message
            })
        }

        if (!value) {
            return res.status(400).send({
                success: false,
                error: 'Iltimos barcha maydonlarni toʻldiring!'
            })
        }

        const checkAdmin = await prisma.admin.findUnique({ where: { phone: value.phone } })

        if (checkAdmin) {
            return res.status(400).send({
                success: false,
                error: 'Bunday telefon raqamga ega Admin roʻyhatdan oʻtgan'
            })
        }

        const hashPassword = await bcrypt.hash(value.password, 10)

        await prisma.admin.create({
            data: {
                name: value.name,
                phone: value.phone,
                password: hashPassword,
                role: value.role
            }
        })

        return res.status(201).send({
            success: true,
            error: false,
            message: 'Admin muvaffaqiyatli yaratildi!'
        })

    } catch (error) {
        throw error
    }
}

const getAllAdmins = async (req, res) => {
    try {
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                pharmacy: true,
            }
        })

        if (admins.length == 0) {
            return res.status(404).send({
                success: false,
                error: 'Adminlar topilmadi!'
            })
        }

        return res.status(200).send({
            success: true,
            error: false,
            admins
        })
    } catch (error) {
        throw error
    }
}

const getOneAdmin = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const admin = await prisma.admin.findFirst({ where: { id } })

        if (!admin) {
            return res.status(404).send({
                success: false,
                error: 'Admin topilmadi!'
            })
        }

        return res.status(200).send({
            success: true,
            error: false,
            admin
        })

    } catch (error) {
        throw error
    }
}

const updateAdmin = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const admin = await prisma.admin.findFirst({ where: { id } })

        if (!admin) {
            return res.status(404).send({
                success: false,
                error: 'Admin topilmadi!'
            })
        }

        const { error, value } = adminUpdateSchema.validate(req.body, { abortEarly: false })
        if (error) {
            return res.status(400).send({
                success: false,
                error: error.details[0].message
            })
        }

        if (!value) {
            return res.status(400).send({
                success: false,
                error: 'Iltimos barcha maydonlarni toʻldiring!'
            })
        }

        const checkPhone = await prisma.admin.findUnique({ where: { phone: value.phone } })

        if (checkPhone && checkPhone.id !== id) {
            return res.status(400).send({
                success: false,
                error: 'Bunday telefon raqamga ega admin mavjud! Iltimos boshqa raqam kiriting!'
            });
        }

        await prisma.admin.update({
            where: { id },
            data: { ...value }
        })

        return res.status(201).send({
            success: true,
            error: false,
            message: "Admin ma'lumotlari muvaffaqiyatli yangilandi!"
        })

    } catch (error) {
        throw error
    }
}

const updateAdminPassword = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const admin = await prisma.admin.findFirst({ where: { id } })

        if (!admin) {
            return res.status(404).send({
                success: false,
                error: 'Admin topilmadi!'
            })
        }

        const { error, value } = updatePasswordSchema.validate(req.body, { abortEarly: false })
        if (error) {
            return res.status(400).send({
                success: false,
                error: error.details[0].message
            })
        }

        if (!value) {
            return res.status(400).send({
                success: false,
                error: 'Parolni kiriting!'
            })
        }

        const hashPassword = await bcrypt.hash(value.password, 10)

        await prisma.admin.update({ where: { id }, data: { password: hashPassword } })

        return res.status(201).send({
            success: true,
            error: false,
            message: 'Parol muvaffaqiyatli yangilandi!'
        })
    } catch (error) {
        throw error
    }
}

const deleteAdmin = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const admin = await prisma.admin.findFirst({ where: { id } })

        if (!admin) {
            return res.status(404).send({
                success: false,
                error: 'Admin topilmadi!'
            })
        }

        await prisma.admin.delete({ where: { id } })

        return res.status(200).send({
            success: true,
            error: false,
            message: 'Admin muvaffaqiyatli oʻchirildi'
        })
    } catch (error) {
        throw error
    }
}

export { adminCreate, getAllAdmins, getOneAdmin, updateAdmin, updateAdminPassword, deleteAdmin }