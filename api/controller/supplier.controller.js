import { createSupplierSchema, updateSupplierSchema } from "../validator/supplierValidate.js"
import prisma from '../prisma/setup.js'
import bcrypt from 'bcrypt'


const createSupplier = async (req, res) => {
    try {
        const { error, value } = createSupplierSchema.validate(req.body, { abortEarly: false })
        if (error) {
            return res.status(400).send({
                success: false,
                error: error.details[0].message
            })
        }

        if (!value) {
            return res.status(400).send({
                success: false,
                error: 'Barcha maydonlarni toʻldiring!'
            })
        }

        const checkPhone = await prisma.supplier.findUnique({ where: { phone: value.phone } })

        if (checkPhone) {
            return res.status(400).send({
                success: false,
                error: 'Bunday telefon raqamga ega yetkazib beruvchi roʻyhaatdan oʻtgan!'
            })
        }

        const passwordHash = await bcrypt.hash(value.password, 10)

        const supplier = await prisma.supplier.create({
            data: {
                name: value.name,
                phone: value.phone,
                password: passwordHash,
                role: value.role
            }
        })

        return res.status(201).send({
            success: true,
            error: false,
            message: 'Yetkazib beruvchi muvaffaqiyatli yaratildi!'
        })
    } catch (error) {
        throw error
    }
}

const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                createdAt: true
            }
        })

        if (suppliers.length == 0) {
            return res.status(404).send({
                success: false,
                error: 'Yetkazib beruvchilar topilmadi!'
            })
        }

        return res.status(200).send({
            success: true,
            error: false,
            suppliers
        })
    } catch (error) {
        throw error
    }
}

const getOneSupplier = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const supplier = await prisma.supplier.findFirst({ where: { id } })

        if (!supplier) {
            return res.status(404).send({
                success: false,
                error: 'Yetkazib beruvchi topilmadi!'
            })
        }

        return res.status(200).send({
            success: true,
            error: false,
            supplier
        })
    } catch (error) {
        throw error
    }
}

const updateSupplier = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const supplier = await prisma.supplier.findFirst({ where: { id } })

        if (!supplier) {
            return res.status(404).send({
                success: false,
                error: 'Yetkazib beruvchi topilmadi!'
            })
        }

        const { error, value } = updateSupplierSchema.validate(req.body, { abortEarly: false })


        if (!value) {
            return res.status(400).send({
                success: false,
                error: 'Barcha maydonlarni toʻldiring!'
            })
        }

        await prisma.supplier.update({
            where: { id },
            data: {
                name: value.name,
                phone: value.phone,
            }
        })

        return res.status(201).send({
            success: true,
            error: false,
            message: "Yetkazib beruvchi ma'lumotlari muvaffaqiyatli yangilandi!"
        })

    } catch (error) {
        throw error
    }
}

const deleteSupplier = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const supplier = await prisma.supplier.findFirst({ where: { id } })

        if (!supplier) {
            return res.status(404).send({
                success: false,
                error: 'Yetkazib beruvchi topilmadi!'
            })
        }

        await prisma.supplier.delete({ where: { id } })

        return res.status(200).send({
            success: true,
            error: false,
            message: 'Yetkazib beruvchi muvaffaqiyatli oʻchirildi!'
        })

    } catch (error) {
        throw error
    }
}

export { createSupplier, getAllSuppliers, getOneSupplier, updateSupplier, deleteSupplier }