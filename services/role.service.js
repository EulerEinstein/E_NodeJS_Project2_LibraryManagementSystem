const { Role } = require("../models");

// Start with CRUD operations:
const createNewRole = (body) => {
	return Role.create({ ...body });
};

const findManyRoles = (searchParam) => {
	return Role.findAll({ where: { ...searchParam  }, order: [["name", "ASC"]] });
};

const findRoleById = async (id) => {
	const role = await Role.findByPk(id);
    if(!role) throw new Error("Role with specified id does not exist");
	return role;
};

const findOneRole = (searchParam) => {
	return Role.findOne({ where: { ...searchParam  }});
};

const findRoleByIdAndUpdate = async (id, body) => {
	const role = await findRoleById(id);
	for (const key of Object.keys(body)) {
		role[key] = body[key] ?? role[key];
	};
	await role.save();
	return role;
};

const findRoleByIdAndDelete = async (id) => {
	const role = await findRoleById(id);
	await role.destroy();
	return role;
};

module.exports = {
	createNewRole,
    findRoleById,
    findOneRole,
    findManyRoles,
    findRoleByIdAndUpdate,
    findRoleByIdAndDelete,
};
