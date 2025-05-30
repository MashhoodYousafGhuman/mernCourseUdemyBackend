const multer = require('multer')

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/png': 'png',
};

const fileUpload = multer({
    limits: 500000,
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images');
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype];
            const randomID = Math.random().toString(36).slice(2);
            cb(null, randomID + '.' + ext)
        }
    })
})

module.exports = fileUpload;