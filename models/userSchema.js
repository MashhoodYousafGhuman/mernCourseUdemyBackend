const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, required: true },
    places: { type: String, required: true },
});

// Don't add userSchema.plugin(uniqueValidator);
// instructor using mongoose-unique-validator but deprecated in newer versions there unique:true will handle the same work

module.exports = mongoose.model('User', userSchema);


