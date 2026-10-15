const { Session, User, Role } = require("../models");

const SESSION_DURATION = 1000 * 60 * 60 * 24; // 1 day

const createNewSession = (userId) => {
	return Session.create({
		userId,
		expiresAt: new Date(Date.now() + SESSION_DURATION),
	});
};

const findSessionById = (id) => {
	return Session.findByPk(id, { include: [{ model: User, include: [Role] }] });
};

const findSessionByIdAndDelete = async (id) => {
	const session = await Session.findByPk(id);
	if (session) await session.destroy();
	return session;
};

module.exports = {
	SESSION_DURATION,
	createNewSession,
	findSessionById,
	findSessionByIdAndDelete,
};
