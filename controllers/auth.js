const jwt = require("../services/jwt");
const moment = require("moment");
const User = require("../models/user");

function willExpireToken(token) {
	const { exp } = jwt.decodedToken(token);
	const currentDate = moment().unix();

	if (currentDate > exp) {
		return true;
	}
	return false;
}

function refreshAccessToken(req, res) {
	const { refreshToken } = req.body;
	const isTokenExpired = willExpireToken(refreshToken);

	if (isTokenExpired) {
		res.status(404).send({
			message: "The token has expired.",
		});
	} else {
		const { id } = jwt.decodedToken(refreshToken);

		User.findOne({ _id: id }, (err, userStored) => {
			if (err) {
				res.status(500).send({ message: "Server Error." });
			} else {
				if (!userStored) {
					res.status(404).send({ message: "User not found." });
				} else {
					res.status(200).send({
						accessToken: jwt.createAccesstoken(userStored),
						resfreshToken: refreshToken,
					});
				}
			}
		});
	}
	console.log("We are refreshing the access token.");
	console.log("isTokenExpired", isTokenExpired);
}

module.exports = {
	refreshAccessToken,
};
