import jwt from 'jsonwebtoken'
import { JWT_KEY } from '../config/config.js';

const roleAccessMiddleware = function (roles) {
    return async function (req, res, next) {
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

            const { role } = jwt.verify(token, JWT_KEY);

            if (!roles.includes(role)) {
                return res.status(403).send({
                    error: "Sizga ruxsat yo'q",
                });
            }

            next();
        } catch (error) {
            throw error
        }
    };
};

export default roleAccessMiddleware