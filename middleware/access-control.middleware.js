const expressAsyncHandler = require("express-async-handler");
const { findSessionById } = require("../services/session.service");

// req → the incoming request
// res → the response we can send back
// next → a function that tells Express to continue to the next middleware/route handler
const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
	const session = await findSessionById(req.cookies.sessionId);

	if (!session || session.expiresAt < new Date()) {
		if (session) await session.destroy(); // remove the expired row
		res.clearCookie("sessionId");
		res.status(401);
		throw new Error("User is not logged in");
	}

	req.user = session.User; // includes Role
	next();
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
