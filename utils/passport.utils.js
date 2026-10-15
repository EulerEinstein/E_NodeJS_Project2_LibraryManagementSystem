// Passport is only used to check the email + password (Local Strategy).
// Sessions are handled by our own Session table, so there is no
// serializeUser / deserializeUser here.
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
