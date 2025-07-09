import { Router } from 'express'
import { createMedicine, deleteMedicine, getAllMedicines, getOneMedicine, updateMedicine } from '../../controller/medicine.controller.js'
import upload from '../../helper/multer.js'
import roleAccessMiddleware from '../../middleware/roleAccessMiddleware.js'


const router = Router()


router
.post('/medicine/create', roleAccessMiddleware(['superAdmin', 'admin']), upload.single('image'), createMedicine)
.get('/medicines', roleAccessMiddleware(['superAdmin', 'admin']), getAllMedicines)
.get('/medicine/:id', roleAccessMiddleware(['superAdmin', 'admin']), getOneMedicine)
.put('/medicine/:id/update', roleAccessMiddleware(['superAdmin', 'admin']), upload.single('image'), updateMedicine)
.delete('/medicine/:id/delete', roleAccessMiddleware(['superAdmin', 'admin']), deleteMedicine)

export default router