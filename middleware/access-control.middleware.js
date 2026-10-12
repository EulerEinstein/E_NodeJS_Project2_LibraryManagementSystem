const expressAsyncHandler = require("express-async-handler");

// req → the incoming request
// res → the response we can send back
// next → a function that tells Express to continue to the next middleware/route handler
// req.isAuthenticated() is normally provided by Passport.js.
// It checks whether Passport has authenticated the current request.
const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else { 
		throw new Error("User is not logged in");
	}
});

module.exports = { isAuthenticated };
