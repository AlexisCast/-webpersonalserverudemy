const bcrypt = require("bcryptjs");
const jwt = require("../services/jwt");
const { restart } = require("nodemon");
const User = require("../models/user");

function signUp(req, res) {
	const user = new User();

	console.log(req.body);

	const { name, lastname, email, password, repeatPassword } = req.body;
	user.name = name;
	user.lastname = lastname;
	user.email = email.toLowerCase();
	user.role = "admin";
	user.active = false;

	if (!password || !repeatPassword) {
		res.status(404).send({ message: "Passwords must be mandatory." });
	} else {
		if (password !== repeatPassword) {
			res.status(404).send({
				message: "The passwords are not the same.",
			});
		} else {
			bcrypt.hash(password, 8, function (err, hash) {
				if (err) {
					res.status(500).send({
						message: "Error encrypting password.",
					});
				} else {
					user.password = hash;
					user.save((err, userStored) => {
						if (err) {
							res.status(500).send({
								message: "User already exist.",
							});
						} else {
							if (!userStored) {
								res.status(404).send({
									message: "Error in creating user.",
								});
							} else {
								res.status(200).send({ user: userStored });
							}
						}
					});
				}
			});
		}
	}
}

function signIn(req, res) {
	console.log("Login correct...");
	const params = req.body;
	console.log("params", params);
	const email = params.email.toLowerCase();
	const password = params.password;

	User.findOne({ email }, (err, userStored) => {
		if (err) {
			res.status(500).send({ message: "Error from server." });
		} else {
			if (!userStored) {
				res.status(404).send({ message: "Usuario not found." });
			} else {
				console.log("userStored", userStored);
				bcrypt.compare(password, userStored.password, (err, check) => {
					if (err) {
						res.status(500).send({ message: "Server error." });
					} else if (!check) {
						res.status(404).send({
							message: "The password is incorrect.",
						});
					} else {
						if (!userStored.active) {
							res.status(200).send({
								code: 200,
								message: "User is not active.",
							});
						} else {
							res.status(200).send({
								accessToken: jwt.createAccesstoken(userStored),
								refreshToken: jwt.createRefreshToken(
									userStored
								),
							});
						}
					}
				});
			}
		}
	});
}

module.exports = {
	signUp,
	signIn,
};
