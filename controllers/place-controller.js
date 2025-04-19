const HttpError = require("../models/http-error");

const DUMMY_PLACES = [{
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
const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_PLACES.find(p => {
        return p.creator === userId;
    });
    // console.log('req.ip', req.headers)
    if (!place) {
        return next(
            new HttpError('Could not find a place for the provided user id', 404)
        );

        // return res.status(404).json({ message: "Couldn't find a place for the provided user id." })
    }

    res.json({ place })
};


const createPlace = (req, res, next) => {
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

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;