import multer from 'multer'

const storage = multer.memoryStorage({
    destination: 'image/'
})

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" ||
            file.mimetype == "image/png" || file.mimetype == "image/avf" ||
            file.mimetype == "image/webp" || file.mimetype == "image/svg" ||
            file.mimetype == "image/ico"
        ) {
            cb(null, true)
        } else {
            cb(new Error('Faqat rasm fayllarga ruxsat beriladi'), false)
        }
    },
})

export default upload