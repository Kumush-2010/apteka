import { Router } from 'express'
import { createSupplier, deleteSupplier, getAllSuppliers, getOneSupplier, updateSupplier } from '../../controller/supplier.controller.js'
import roleAccessMiddleware from '../../middleware/roleAccessMiddleware.js'

const router = Router()


router
    .post('/supplier/create', roleAccessMiddleware('superAdmin'), createSupplier)
    .get('/suppliers', roleAccessMiddleware(['superAdmin', 'admin']), getAllSuppliers)
    .get('/supplier/:id', roleAccessMiddleware(['superAdmin', 'admin']), getOneSupplier)
    .post('/supplier/:id/update', roleAccessMiddleware(['superAdmin', 'admin']), updateSupplier)
    .delete('/supplier/:id/delete', roleAccessMiddleware('superAdmin'), deleteSupplier)

export default router