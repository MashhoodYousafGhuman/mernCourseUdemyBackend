const express = require("express");
const { check } = require('express-validator')

const placeControllers = require('../controllers/places-controllers');
const fileUpload = require("../middleware/file-upload-middleware");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();


router.get('/:pid', placeControllers.getPlaceById);

router.get('/user/:uid', placeControllers.getPlacesByUserId);

router.use(verifyToken)

router.post('/',
    fileUpload.single('image'),
    [
        // check is a middleWare function coming from express-validator, have various methods and functions;
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty(),
    ],
    placeControllers.createPlace
);

router.patch('/:pid',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 })
    ],
    placeControllers.updatePlace);

router.delete('/:pid', placeControllers.deletePlace);

module.exports = router;