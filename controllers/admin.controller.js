const asyncHandler = require("express-async-handler");
const { 
    findManyUsers, 
    createNewUser, 
    findUserById,
    findUserByIdAndUpdate,
    findUserByIdAndDelete
} = require("../services/user.service");
const { findRoleById } = require("../services/role.service");

const getAllStaffHandler = asyncHandler(async (req,res) => {
	const staff = await findManyUsers({ isStaff: true });
res.json(staff);
});

const createStaffUserHandler = asyncHandler(async (req, res) => {
	const { roleId, email, username, password } = req.body;
	if(!(roleId && email && username && password)) throw new Error("Bad request, please use all fields");
	const newStaffMember = await createNewUser({ roleId, email, username, password, isStaff: true });
	res.json(newStaffMember);
});

const updateStaffHandler = asyncHandler(async (req, res) => {
	const { roleId, email, username, password } = req.body;

    // throws "Role with specified id does not exist"
    if (roleId) await findRoleById(roleId); 
	
    await findUserByIdAndUpdate(req.params.id, { roleId, email, username, password });
	
    // fresh load, so Role matches roleId
    const updateStaff = await findUserById(req.params.id);
    res.status(202).json(updateStaff);
});

const deleteStaffHandler = asyncHandler(async (req, res) => {
	const updateStaff = await findUserByIdAndUpdate(req.params.id, { isStaff: false, roleId: null });
	res.status(202).json(updateStaff);
});

const getAllUsersHandler = asyncHandler(async (req, res) => {
	const users = await findManyUsers({});
	res.json(users);
});

const removeUserHandler = asyncHandler(async (req, res) => {
	const user = await findUserByIdAndDelete(req.params.id);
	res.status(202).json(user);
});

module.exports = { 
    getAllStaffHandler, 
    createStaffUserHandler, 
    updateStaffHandler, 
    deleteStaffHandler,
    getAllUsersHandler,
    removeUserHandler
};
