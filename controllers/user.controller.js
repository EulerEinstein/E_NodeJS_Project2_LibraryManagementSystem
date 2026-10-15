const asyncHandler = require("express-async-handler");
const { createNewUser, findUserByIdAndUpdate } = require("../services/user.service.js");
const { SESSION_DURATION, createNewSession, findSessionByIdAndDelete } = require("../services/session.service");

const signUpHandler = asyncHandler(async (req, res) => {
        const  { username, password, email } = req.body;
        
        if(!(username && password && email)) throw new Error("Bad request, username, password and email are required");
        const user = await createNewUser({username, password, email});
        res.status(201).json(user);
});

const getCurrentUserHandler = asyncHandler(async (req, res) => {
	res.json(req.user);
});

const loginHandler = asyncHandler(async (req, res) => {
	const session = await createNewSession(req.user.id);
	res.cookie("sessionId", session.id, {
		httpOnly: true,
		sameSite: "lax",
		maxAge: SESSION_DURATION,
	});
	res.json(req.user);
});

const logoutUserHandler = asyncHandler(async (req, res) => {
	if (req.cookies.sessionId) await findSessionByIdAndDelete(req.cookies.sessionId);
	res.clearCookie("sessionId");
	res.sendStatus(200);
});

const updateUserHandler = asyncHandler(async (req, res) => {
	const { password, username, email } = req.body;
	const user = await findUserByIdAndUpdate( req.user.id, {
		password,
		username,
		email,
	});
	res.json(user);
});


module.exports = { signUpHandler, getCurrentUserHandler, loginHandler, logoutUserHandler, updateUserHandler };