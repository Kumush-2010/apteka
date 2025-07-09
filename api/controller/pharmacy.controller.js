import prisma from "../prisma/setup.js"
import { pharmacyCreateSchema, updatePharmacySchema } from "../validator/pharmacyValidate.js"
import extractLatLngFromMapUrl from "./location.controller.js"


const pharmacyCreate = async (req, res) => {
    try {
        const { error, value } = pharmacyCreateSchema.validate(req.body, { abortEarly: false })

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

        const coords = extractLatLngFromMapUrl(value.locationUrl)

        if (!coords) {
            return res.status(400).send({
                success: false,
                error: "Koordinatalarni ajratib bo‘lmadi"
            })
        }

        const admin = await prisma.admin.findFirst({ where: { id: value.adminId } })

        if (!admin) {
            return res.status(404).send({
                success: false,
                error: 'Bunday admin mavjud emas!'
            })
        }

        const supplier = await prisma.supplier.findFirst({ where: { id: value.supplierId } })

        if (!supplier) {
            return res.status(404).send({
                success: false,
                error: 'Bunday yetkazib beruvchi mavjud emas!'
            })
        }

        await prisma.pharmacy.create({
            data: {
                name: value.name,
                address: value.address,
                locationUrl: value.locationUrl,
                latitude: coords.lat,
                longitude: coords.lng,
                destination: value.destination,
                phone: value.phone,
                adminId: value.adminId,
                supplierId: value.supplierId
            }
        })

        return res.status(201).send({
            success: true,
            error: false,
            message: "Dorixona muvaffaqiyatli yaratildi!"
        })

    } catch (error) {
        throw error
    }
}

const getAllPharmacies = async (req, res) => {
    try {
        const pharmacies = await prisma.pharmacy.findMany()

        if (pharmacies.length == 0) {
            return res.status(404).send({
                success: false,
                error: 'Dorixonalar toplimadi'
            })
        }

        return res.status(200).send({
            success: true,
            error: false,
            pharmacies
        })

    } catch (error) {
        throw error
    }
}

const getOnePharmacy = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const pharmacy = await prisma.pharmacy.findFirst({ where: { id } })

        if (!pharmacy) {
            return res.status(404).send({
                success: false,
                error: 'Dorixona topilmadi!'
            })
        }

        return res.status(200).send({
            success: true,
            error: false,
            pharmacy
        })

    } catch (error) {
        throw error
    }
}

const pharmacyUpdate = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const pharmacy = await prisma.pharmacy.findFirst({ where: { id } })

        if (!pharmacy) {
            return res.status(404).send({
                success: false,
                error: 'Dorixona topilmadi!'
            })
        }

        const { error, value } = updatePharmacySchema.validate(req.body, { abortEarly: false })

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

        const coords = extractLatLngFromMapUrl(value.locationUrl)

        if (!coords) {
            return res.status(400).send({
                success: false,
                error: "Koordinatalarni ajratib bo‘lmadi"
            })
        }

        const admin = await prisma.admin.findFirst({ where: { id: value.adminId } })

        if (!admin) {
            return res.status(404).send({
                success: false,
                error: 'Bunday admin mavjud emas!'
            })
        }

        const supplier = await prisma.supplier.findFirst({ where: { id: value.supplierId } })

        if (!supplier) {
            return res.status(404).send({
                success: false,
                error: 'Bunday yetkazib beruvchi mavjud emas!'
            })
        }

        await prisma.pharmacy.update({
            where: { id },
            data: {
                name: value.name || pharmacy.name,
                address: value.address || pharmacy.address,
                locationUrl: value.locationUrl || pharmacy.locationUrl,
                latitude: coords.lat || pharmacy.latitude,
                longitude: coords.lng || pharmacy.longitude,
                destination: value.destination || pharmacy.destination,
                phone: value.phone || pharmacy.phone,
                adminId: value.adminId || pharmacy.adminId,
                supplierId: value.supplierId || pharmacy.supplierId
            }
        })

        return res.status(201).send({
            success: true,
            error: false,
            message: 'Dorixona maʻlumotlari muvaffaqiyatli yangilandi!'
        })
    } catch (error) {
        throw error
    }
}

const deletePharmacy = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const pharmacy = await prisma.pharmacy.findFirst({ where: { id } })

        if (!pharmacy) {
            return res.status(404).send({
                success: false,
                error: 'Dorixona topilmadi!'
            })
        }

        await prisma.pharmacy.delete({ where: { id } })

        return res.status(200).send({
            success: true,
            error: false,
            message: 'Dorixona muvaffaqiyatli oʻchirildi!'
        })

    } catch (error) {
        throw error
    }
}

export { pharmacyCreate, getAllPharmacies, getOnePharmacy, pharmacyUpdate, deletePharmacy }