const axios = require("axios");

const HttpError = require("../models/http-error");


const API_KEY = '';
// The API key is provided by Google after setting up a billing plan.

async function getCoordinatesForAddress(address) {
    return {
        // this is for only if you dont have credit or debit card asked by google;
        lat: 40.7484474,
        lng: -73.9871516
    };

    // the code in the next lines can't run now because i dont have  googleApikey therefore i'm returning dummy data;
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
    );

    const data = response.data;

    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError('Could not find location for the specified address.', 422)
        throw error;
    };

    const coordinates = data.result[0].geometry.location;
    return coordinates;
}

module.exports = getCoordinatesForAddress;