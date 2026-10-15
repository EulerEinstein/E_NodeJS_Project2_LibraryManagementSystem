const { Router } = require("express");
const { 
	requireLogin, 
	requirePermission, 
	pageErrorHandler 
} = require("../middleware/page.middleware");
const page = require("../controllers/page.controller");

const router = Router();

// router.get() - handles GET requests, usually for retrieving data.
// router.post() - handles POST requests, usually for creating data.
// router.use() - applies middleware to matching requests.
// router.route() - groups multiple HTTP methods for the same path.

// Public
router.get("/", page.homePage);
router.route("/login").get(page.loginPage).post(page.loginSubmit);
router.route("/signup").get(page.signupPage).post(page.signupSubmit);
router.post("/logout", page.logoutSubmit);

// Any logged-in user
router.route("/profile").get(requireLogin, page.profilePage).post(requireLogin, page.profileSubmit);
router.get("/books", requireLogin, page.booksPage);

// Books: staff with canManageBooks
router.route("/books/new").get(requirePermission("canManageBooks"), page.newBookPage);
router.post("/books", requirePermission("canManageBooks"), page.createBookSubmit);
router.route("/books/:id/edit")
	.get(requirePermission("canManageBooks"), page.editBookPage)
	.post(requirePermission("canManageBooks"), page.editBookSubmit);
router.post("/books/:id/delete", requirePermission("canManageBooks"), page.deleteBookSubmit);

// Books: staff with canLendBooks
router.post("/books/:id/lend", requirePermission("canLendBooks"), page.lendBookSubmit);
router.post("/books/:id/return", requirePermission("canLendBooks"), page.returnBookSubmit);

// Admin: users (canManageUsers or canManageStaff)
router.get("/admin/users", requirePermission("canManageUsers", "canManageStaff"), page.adminUsersPage);
router.route("/admin/users/:id/edit")
	.get(requirePermission("canManageUsers", "canManageStaff"), page.adminUserEditPage)
	.post(requirePermission("canManageUsers", "canManageStaff"), page.adminUserEditSubmit);

// Admin: roles (canManageStaff)
router.route("/admin/roles")
	.get(requirePermission("canManageStaff"), page.adminRolesPage)
	.post(requirePermission("canManageStaff"), page.createRoleSubmit);
router.post("/admin/roles/:id", requirePermission("canManageStaff"), page.updateRoleSubmit);
router.post("/admin/roles/:id/delete", requirePermission("canManageStaff"), page.deleteRoleSubmit);

router.use(pageErrorHandler);

module.exports = { pageRouter: router };
