import storage from "../helper/supabase.js"
import prisma from "../prisma/setup.js"
import { imageSchema } from "../validator/imageValidate.js"
import { createMedicineSchema, updateMedicineSchema } from "../validator/medicineValidate.js"


const createMedicine = async (req, res) => {
    try {
        const { error, value } = createMedicineSchema.validate(req.body, { abortEarly: false })

        if (error) {
            return res.status(400).send({
                success: false,
                error: error.details[0].message
            })
        }

        if (req.file) {
            const { error, value } = imageSchema.validate(req.file, {
                abortEarly: false
            })
            if (error) {
                return res.status(400).send({
                    success: false,
                    error: error.details[0].message,
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                error: 'Rasm fayl yubormadingiz!'
            })
        }

        const image = await storage.upload(req.file)
        const pharmacyId = Number(value)

        await prisma.medicine.create({
            data: {
                uz_name: value.uz_name,
                ru_name: value.ru_name,
                en_name: value.en_name,
                made: value.made,
                one_plate: value.one_plate,
                one_box: value.one_box,
                one_plate_price: value.one_plate_price,
                one_box_price: value.one_box_price,
                warehouse: value.warehouse,
                image_path: image.path,
                image: image.url,
                pharmacyId: pharmacyId
            }
        })

        return res.status(201).send({
            success: true,
            error: false,
            message: 'Dori muvaffaqiyatli yaratildi!'
        })
    } catch (error) {
        throw error
    }
}

const getAllMedicines = async (req, res) => {
    try {
        const medicines = await prisma.medicine.findMany()

        if (medicines.length == 0) {
            return res.status(404).send({
                success: false,
                error: 'Dorilar topilmadi yoki mavjud emas!'
            })
        }

        return res.status(200).send({
            success: true,
            error: false,
            medicines
        })
    } catch (error) {
        throw error
    }
}

const getOneMedicine = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const medicine = await prisma.medicine.findFirst({ where: { id } })

        if (!medicine) {
            return res.status(404).send({
                success: false,
                error: 'Dori topilmadi yoki mavjud emas!'
            })
        }

        return res.status(200).send({
            success: true,
            error: false,
            medicine
        })
    } catch (error) {
        throw error
    }
}

const updateMedicine = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const medicine = await prisma.medicine.findFirst({ where: { id } })

        if (!medicine) {
            return res.status(404).send({
                success: false,
                error: 'Dori topilmadi yoki mavjud emas!'
            })
        }

        const { error, value } = updateMedicineSchema.validate(req.body, { abortEarly: false })

        if (error) {
            return res.status(400).send({
                success: false,
                error: error.details[0].message
            })
        }

        const dataToUpdate = {
            uz_name: value.uz_name || medicine.uz_name,
            ru_name: value.ru_name || medicine.ru_name,
            en_name: value.en_name || medicine.en_name,
            made: value.made || medicine.made,
            warehouse: value.warehouse || medicine.warehouse,
            one_plate: value.one_plate || medicine.one_plate,
            one_box: value.one_box || medicine.one_box,
            one_plate_price: value.one_plate_price || medicine.one_plate_price,
            one_box_price: value.one_box_price || medicine.one_box_price,
            pharmacyId: value.pharmacyId || medicine.pharmacyId
        };

        if (req.file) {
            const { error: imgErr } = imageSchema.validate(req.file, { abortEarly: false });
            if (imgErr) {
                return res.status(400).send({
                    success: false,
                    error: imgErr.details[0].message,
                });
            }
            // eski rasmni o'chirish
            if (medicine.image_path) {
                await storage.delete(medicine.image_path);
            }
            const image = await storage.upload(req.file);
            dataToUpdate.image_path = image.path;
            dataToUpdate.image = image.url;
        }

        // Yagona update chaqiruvi
        await prisma.medicine.update({
            where: { id },
            data: dataToUpdate
        });

        return res.status(201).send({
            success: true,
            error: false,
            message: 'Dori maʻlumotlari muvaffaqiyatli yangilandi!'
        })

    } catch (error) {
        throw error
    }
}

const deleteMedicine = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).send({
                success: false,
                error: "ID noto‘g‘ri formatda!"
            });
        }

        const medicine = await prisma.medicine.findFirst({ where: { id } })

        if (!medicine) {
            return res.status(404).send({
                success: false,
                error: 'Dori topilmadi yoki mavjud emas!'
            })
        }

        await storage.delete(medicine.image_path)

        await prisma.medicine.delete({ where: { id } })

        return res.status(200).send({
            success: true,
            error: false,
            message: 'Dori muvaffaqiyatli oʻchirildi!'
        })

    } catch (error) {
        throw error
    }
}

export { createMedicine, getAllMedicines, getOneMedicine, updateMedicine, deleteMedicine }