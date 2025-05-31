const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authentications Failed')
        }
        const decodedToken = jwt.verify(token, 'superSecretDontShare');
        req.userData = { userId: decodedToken.userId };
        console.log('token', token)
        next();
    } catch (err) {
        console.log('err', err)
        const error = new HttpError('Authentications Failed', 401);
        console.log('error', error)
        return next(error);
    }
};