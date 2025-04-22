const { validationResult } = require('express-validator');

const HttpError = require("../models/http-error");

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


const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    });

    if (!place) {
        // this will work with error handling middleWare, because i have create the HttpError class that will also short the code therefore, not using this but commenting this due to memory call;

        // const error = new Error('Could not find a place for the provided id')
        // error.code = 404

        // HttpError is class Creating by me 
        throw new HttpError('Could not find a place for the provided id', 404);
    }

    res.json({ place });
};


// 2nd function middleWare
const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;

    const places = DUMMY_PLACES.filter(p => {
        return p.creator === userId;
    });

    if (!places || places.length === 0) {
        return next(
            new HttpError('Could not find a places for the provided user id', 404)
        );

        // return res.status(404).json({ message: "Couldn't find a place for the provided user id." })
    }

    res.json({ places })
};

// 3rd function middleWare
const createPlace = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('errors ==>', errors)
        throw new HttpError('Invalid inputs passed,  please check your data.', 422)
    }

    const { title, description, coordinates, address, creator } = req.body;

    const createdPlace = {
        id: Math.random().toString(36).slice(2),
        title,
        description,
        location: coordinates,
        address,
        creator
    }
    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace });
};

// 4th function middleWare
const updatePlace = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('errors ==>', errors)
        throw new HttpError('Invalid inputs passed,  please check your data.', 422)
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({ place: updatedPlace });

};

// 5th  function middleWare
const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find a place for that id.', 404)
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: 'Place Deleted' });
};

// Exports Stars..
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;