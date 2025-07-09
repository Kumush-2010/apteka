import { Router} from 'express'
import { deletePharmacy, getAllPharmacies, getOnePharmacy, getPharmacy, pharmacyCreate, pharmacyUpdate } from '../../controller/pharmacy.controller.js'
import roleAccessMiddleware from '../../middleware/roleAccessMiddleware.js'

const router = Router()

router
.post('/pharmacy/create', roleAccessMiddleware(['superAdmin', 'admin']), pharmacyCreate)
.get('/pharmacies', roleAccessMiddleware(['superAdmin', 'admin']), getAllPharmacies)
.get('/pharmacies/:id/drugs', roleAccessMiddleware(['superAdmin', 'admin']), getPharmacy)
.get('/pharmacy/:id', roleAccessMiddleware(['superAdmin', 'admin']), getOnePharmacy)
.put('/pharmacy/:id/update', roleAccessMiddleware(['superAdmin', 'admin']), pharmacyUpdate)
.delete('/pharmacy/:id/delete', roleAccessMiddleware('superAdmin'), deletePharmacy)
export default router