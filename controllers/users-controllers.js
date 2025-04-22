const HttpError = require("../models/http-error");

const DUMMY_USERS = [
	{
		id: 'u1',
		name: 'Mashhood Yousaf',
		email: 'test@test.com',
		password: 'testers'
	}
];

const getUsers = (req, res, next) => {
	res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
	const { name, email, password } = req.body;

	const hasUser = DUMMY_USERS.find(u=>u.email === email);
	if(hasUser){
		throw new HttpError('Could not create a User, email already exists',422)
		// 422 status code for invalid user Input;
	}
	
	const createdUser = {
		id: Math.random().toString(36).slice(2),
		name,
		email,
		password
	};

	DUMMY_USERS.push(createdUser);

	res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => { 
	const {email,password} = req.body;

	const identifiedUser = DUMMY_USERS.find(u=>u.email === email);

	if(!identifiedUser || identifiedUser.password !== password){
		throw new HttpError('Could not identify user, credentials seems to be wrong.',401);
	}

	res.json({message:'Logged in'});
};



exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;