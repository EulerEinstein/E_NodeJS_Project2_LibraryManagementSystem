const { User, Role } = require("../models");

// Start with CRUD operations:
const createNewUser = (body) => {
	return User.create({ ...body });
};

const findManyUsers = (searchParam) => {
	return User.findAll({ where: { ...searchParam  }});
};

const findUserById = async (id) => {
	// include:[Role] - "When you find the User, 
	// also find the Role that this User belongs to."
	const user = await User.findByPk(id, { include: Role });
	if (!user) throw new Error("User with specified id does not exist");
	return user;
};

const findOneUser = (searchParam) => {
	return User.findOne({ where: { ...searchParam  }});
};

const findUserByIdAndUpdate = async (id, body) => {
	const user = await findUserById(id);
	// To obtain an array of all of the keys of the object,
	// which is contained in body.
	for (const key of Object.keys(body)) {
		user[key] = body[key] ?? user[key];
	};

	await user.save();
	return user;
};

const findUserByIdAndDelete = async (id) => {
	const user = await findUserById(id);
	await user.destroy();
	return user;
};

module.exports = {
	createNewUser,
    findUserById,
    findOneUser,
    findManyUsers,
    findUserByIdAndUpdate,
    findUserByIdAndDelete,
};
