// passport → handles authentication and sessions.
// passport-local → gives you the Local Strategy, which authenticates 
// using something like email + password.
// bcryptjs → compares the password the user entered against the
// hashed password stored in the database.
// findOneUser → own custom function for finding a user in the
// database.

const Strategy = require("passport-local");
const bcrypt = require("bcryptjs");
const { findOneUser } = require("../services/user.service");

const initPassport = (passport) => {
	const authenticate = async (email, password, cb) => {
		try {
			const user = await findOneUser({ email });
			if (!user) return cb(Error("User not found"));
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) return cb(Error("Bad Credentials"));
			return cb(null, user);
		} catch (err) {
			return cb(err);
		}
	};

	passport.use(new Strategy({ usernameField: "email" }, authenticate));
};

module.exports = { initPassport };