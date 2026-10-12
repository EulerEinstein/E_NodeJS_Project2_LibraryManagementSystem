const { createNewRole } = require("../services/role.service");
const { findUserById } = require("../services/user.service");

const setAdmin = async () => {
	
	//  Create a new role called admin
	const admin = await createNewRole({
		name: "admin",
		canLendBooks: true,
		canManageUsers: true,
		canManageStaff: true,
		canManageBooks: true
	});
	
	// Create an admin user
	const user = await findUserById( "d7978f03-eb8a-45ba-b929-9067c891e6ad" );
	user.isStaff = true;
	user.roleId = admin.id;
	await user.save();
	
	console.log(user);
};

setAdmin();
