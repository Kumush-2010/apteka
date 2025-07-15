
import { Router } from 'express'
import { adminCreate, deleteAdmin, getAllAdmins, getOneAdmin, updateAdmin, updateAdminPassword } from '../../controller/admin.controller.js'
import roleAccessMiddleware from '../../middleware/roleAccessMiddleware.js'

const router = Router()

router
.post('/admin/create', roleAccessMiddleware('superAdmin'), adminCreate)
.get('/admins', roleAccessMiddleware(['admin', 'superAdmin']), getAllAdmins)
.get('/admin/:id', roleAccessMiddleware(['admin', 'superAdmin']), getOneAdmin)
.put('/admin/:id/update', roleAccessMiddleware('superAdmin'), updateAdmin)
.put('/admin/:id/update-pass', roleAccessMiddleware('superAdmin'), updateAdminPassword)
.delete('/admin/:id/delete', roleAccessMiddleware('superAdmin'), deleteAdmin)

export default router