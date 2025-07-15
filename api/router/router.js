
import adminRouter from './admin/admin.router.js'
import authRouter from './auth/auth.router.js'
import supplierRouter from './supplier/supplier.router.js'
import pharmacyRouter from './pharmacy/pharmacyRouter.js'
import medicineRouter from './medicine/medicineRouter.js'
import jwtAccessMiddleware from '../middleware/jwtAccessMiddleware.js'

export const appRouter = (app) => {
    app.use('/', authRouter)
    app.use('/', jwtAccessMiddleware, adminRouter)
    app.use('/', jwtAccessMiddleware, supplierRouter)
    app.use('/', jwtAccessMiddleware, pharmacyRouter)
    app.use('/', jwtAccessMiddleware, medicineRouter)
}