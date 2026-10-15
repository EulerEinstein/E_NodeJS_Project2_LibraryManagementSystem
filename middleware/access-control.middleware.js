const expressAsyncHandler = require("express-async-handler");
const { findSessionById } = require("../services/session.service");

// API: checks the sessionId cookie, loads the user (with Role) into req.user.
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
		if (req.user?.Role?.[permission]) {
            return next();
        }
		
		res.status(403);
		throw new Error("Forbidden resource");
	}
};

module.exports = { isAuthenticated, isStaff, hasPermission };
