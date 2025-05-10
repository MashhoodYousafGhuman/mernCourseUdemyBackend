const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require("../models/http-error");
const getCoordinatesForAddress = require('../util/location');
const Place = require('../models/placeSchema');
const User = require('../models/userSchema');

let DUMMY_PLACES = [{
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapper',
    location: {
        lat: 40.7484474,
        lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
}];


const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    // the find method was using where there was no database, so for now using findById method to find from database!
    // const place = DUMMY_PLACES.find(p => {
    //     return p.id === placeId;
    // });

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }

    if (!place) {
        // this will work with error handling middleWare, because i have create the HttpError class that will also short the code therefore, not using this but commenting this due to memory call or revision of concepts;

        // const error = new Error('Could not find a place for the provided id')
        // error.code = 404

        // HttpError is class Creating by me;
        const error = new HttpError('Could not find a place for the provided id', 404);
        return next(error);
    }

    // getters : true => is returning id key value with the same value of _id 
    res.json({ place: place.toObject({ getters: true }) });
};


// 2nd function middleWare
const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    // const places = DUMMY_PLACES.filter(p => {
    //     return p.creator === userId;
    // });
    let places;
    try {
        places = await Place.find({ creator: userId })
    } catch (err) {
        const error = new HttpError('Could not find a places for the provided user id', 404);
        return next(error);
    }


    if (!places || places.length === 0) {
        return next(
            new HttpError('Could not find a places for the provided user id', 404)
        );

        // return res.status(404).json({ message: "Couldn't find a place for the provided user id." })
    }

    // find() from mongoose → returns an array of documents. therefore we cant use .toObject() but can run map!
    res.json({ places: places.map(place => place.toObject({ getters: true })) })
};

// 3rd function middleWare
const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('errors ==>', errors)
        return next(new HttpError('Invalid inputs passed,  please check your data.', 422));
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordinatesForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ_G9U9095poYEIvtg8fnA2Ef3dcjLEebptQ&s',
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating Place failed, please try again later', 500)
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find a user with provided id', 404);
        return next(error);
    }
    console.log('user from placeControll file, from create place', user);



    try {
        // await createdPlace.save(); commentig this line because first we was saving the place without adding the placeId to the corresponding user, was doing with a dummyId data, now if we create a place the placeId will also be added to the related/corresponding user, to acheive this we will create session and transactions, if feeling unfamiliar with the term session and transactions , first learn this topics , is very easy and interesting
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();

    } catch (err) {
        const error = new HttpError('Error While creating a Place, please try again later.', 500);
        return next(error);
    }

    // .push  isn't logic here beacuse now we are working with database the logic now is .save();
    // DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace });
};

// 4th function middleWare
const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('errors ==>', errors)
        return next(
            new HttpError('Invalid inputs passed,  please check your data.', 422)
        );
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong while updating a place, please try again later!', 500)
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong while updating a place, please try again later!', 500)
        return next(error);
    }

    // using this logic for only when there was no database here!
    // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
    // updatedPlace.title = title;
    // updatedPlace.description = description;
    // DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({
        place: place.toObject({ getters: true })
    });

};

// 5th  function middleWare
const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    // if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    //     throw new HttpError('Could not find a place for that id.', 404)
    // }
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong while deleting a place, please try again later!', 500)
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find the place for this id', 404)
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        // await place.remove(); this is deprcated from mongoose and older syntax , will use deleteOne() and deleteMany()
        await place.deleteOne({ session: sess });
        place.creator.places.pull(place);
        // pull will remove the id so we don't have to explictly tell the mongoose to remove an id
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
        console.log('place=>', place)
        console.log('place.creator.places=>', place.creator.places)

    } catch (err) {
        const error = new HttpError('Something went wrong while deleting a place, please try again later!', 500)
        return next(error);
    }

    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: 'Place Deleted' });
};

// Exports Stars..
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;