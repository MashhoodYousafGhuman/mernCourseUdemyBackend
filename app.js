require('dotenv').config();

const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));
// app.use(
//     // this line will be used if we want to deploy our fEnd and bEnd on same server;
//     express.static(path.join('public'))
// );

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});


app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// app.use((req, res, next) => {
// this line will be used if we want to deploy our fEnd and bEnd on same server;
//     res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
// })

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});



app.use((error, req, res, next) => {
    // middleWare for sensding errors, like a errorAPI , this middleWare will run or apply  on every function or middleWare that have error attached to it
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log('err while unlinking file in app.js', err)
        });
    }

    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An Unkwon Error Occured!' })
});

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("🔍 MONGO_URL =", process.env.MONGO_URL);
        app.listen(process.env.PORT || 5000)
        console.log('Database Connected');
        console.log('server is running');
    })
    .catch((error) => {
        console.log('error while connecting Database, DB Connection Failed', error)
    });
