require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();
app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});


// middleWare for sending errors, like a errorAPI , this middleWare will run or apply  on every function or middleWare that have error attached to it

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An Unkwon Error Occured!' })
});

mongoose
    .connect(`mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER_NAME}.0ixtjhc.mongodb.net/`)
    .then(()=>{
        app.listen(5000)
        console.log('Database Connected');
        console.log('server is running');
    })
    .catch((error)=>{
        console.log('error while connecting Database, DB Connection Failed', error)
    });
