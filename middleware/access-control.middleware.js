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

const isStaff = (req, res, next) => {
	if (req.user.isStaff) return next();
	res.status(403);
	throw new Error("Forbidden resource");
};

const hasPermission = (permission) => {
	return (req, res, next) => { 
		// The ?. operator is called optional chaining. 
		// It prevents JavaScript from throwing a TypeError 
		// when req.user or req.user.Role is missing.
		// Now, if the permission is missing or the role 
		// is undefined, the middleware throws "Forbidden 
		// resource" with HTTP status 403.
		if (req.user.Role[permission]) return next();		
		res.status(403);
		throw new Error("Forbidden resource");
	}
};

module.exports = { isAuthenticated, isStaff, hasPermission };
