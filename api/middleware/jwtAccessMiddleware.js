import jwt from 'jsonwebtoken'
import { JWT_KEY } from '../config/config.js'

const jwtAccessMiddleware = function (req, res, next) {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(404).send({
                error: 'Iltimos qayta kirish qiling!',
            });
        }

        const token = authHeader.split(' ')[1];


        if (!token) {
            return res.status(401).send({
                success: false,
                error: 'Iltimos qayta kirish qiling!'
            })
        }

        const user = jwt.verify(token, JWT_KEY)

        req.user = user
        next()
    } catch (error) {

        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                error: 'Iltimos, qayta kirish qiling!',
            });
        }

        if (error.message) {
            return res.status(400).send({
                error: error.message,
            });
        }
        throw error
    }
}

export default jwtAccessMiddleware