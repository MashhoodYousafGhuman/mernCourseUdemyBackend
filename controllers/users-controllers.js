const { validationResult } = require('express-validator');

const HttpError = require("../models/http-error");
const User = require('../models/userSchema');


const getUsers = async (req, res, next) => {
	// const user = User.find({}, 'email name');
	// both upper and lower approaches can be used
	let users;
	try {
		users = await User.find({}, '-password');
	} catch (err) {
		const error = new HttpError('Fetching users failed, please try again later', 500)
		return next(error);
	}

	if (!users || users.length === 0) {
		const error = new HttpError('It seems there is no even a single user, please create a user first;', 404)
		return next(error);
	}

	// find method from mongoose returns an array therefore runnig map() to convert each mongoose object to normal jsObject by .toObject() getters true will return _id by normalizing to id property only!
	res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log('errors ==>', errors)
		return next(
			new HttpError('Invalid inputs passed,  please check your data.', 422)
		);
	}

	const { name, email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('Sign-up failed, please try again later;', 500);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError('User already Exists, try login', 422);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		password,
		image: 'https://images.unsplash.com/photo-1605496036006-fa36378ca4ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHVybHxlbnwwfHwwfHx8MA%3D%3D',
		places: []
	})

	try {
		await createdUser.save();
	} catch (err) {
		console.error('Signup error:', err); // Log actual error
		const error = new HttpError('Signing up failed, please try again later!', 500);
		return next(error);
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError('Sign-in failed, please try again later;', 500);
		return next(error);
	}

	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError('Invalid Credentials, please try again', 422);
		return next(error);
	}

	res.json({
		message: 'Logged in',
		user: existingUser.toObject({ getters: true })
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;