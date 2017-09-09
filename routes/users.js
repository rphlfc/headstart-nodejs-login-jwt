const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

router.post('/register', function (req, res, next) {

	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;

	if (name === "") {
		return res.json({success: false, msg: 'Please provide a name.'});
	}

	if (email === "") {
		return res.json({success: false, msg: 'Please provide a valid email address.'});
	}

	if (password === "") {
		return res.json({success: false, msg: 'Please provide a password.'});	
	}

	let newUser = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password
	});

	User.addUser(newUser, function (err, user) {
		if (err) {
			res.json({success: false, msg: 'Failed to register user.'});
		} else {
			user.password = null;
			delete user.password;

			const token = jwt.sign(user, config.secret, {
				expiresIn: 604800 // 1 week
			});

			res.json({success: true, msg: 'User registered.', token: 'JWT ' + token, user: user});
		}
	});
});

router.post('/authenticate', function (req, res, next) {
	const email = req.body.email;
	const password = req.body.password;

	if (email === "") {
		return res.json({success: false, msg: 'Please provide a valid email address.'});
	}

	if (password === "") {
		return res.json({success: false, msg: 'Please provide a password.'});	
	}

	User.getUserByEmail(email, (err, user) => {
		if (err) throw err;
		if (!user) {
			return res.json({success: false, msg: 'User not found.'});
		}

		User.comparePassword(password, user.password, (err, isMatch) => {
			if (err) throw err;
			if (isMatch) {
				const token = jwt.sign(user, config.secret, {
					expiresIn: 604800 // 1 week
				});

				res.json({
					success: true,
					token: 'JWT ' + token,
					user: {
						id: user._id,
						name: user.name,
						email: user.email
					}
				})
			} else {
				return res.json({success: false, msg: 'Invalid email and/or password.'});
			}
		});
	});
});

router.get('/profile', passport.authenticate('jwt', {session: false}), function (req, res, next) {
	res.json({user: req.user});
});

module.exports = router;