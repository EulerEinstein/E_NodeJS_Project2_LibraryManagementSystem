const { Router } = require("express");
const { 
    findAllRolesHandler, 
    newRoleHandler, 
    updateRoleHandler, 
    deleteRoleHandler 
} = require("../controllers/role.controller");
const { 
    isAuthenticated, 
    isStaff, 
    hasPermission 
} = require("../middleware/access-control.middleware");

const router = Router();

router.use(isAuthenticated);
router.use(isStaff);
router.use(hasPermission("canManageStaff"));

router.route("/")
	.get(findAllRolesHandler)
	.post(newRoleHandler);

router.route("/:id")
	.patch(updateRoleHandler)
	.delete(deleteRoleHandler);

module.exports = router;
