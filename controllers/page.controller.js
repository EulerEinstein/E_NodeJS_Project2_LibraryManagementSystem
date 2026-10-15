const asyncHandler = require("express-async-handler");
const passport = require("passport");
const { setFlash } = require("../middleware/page.middleware");
const { createNewUser, findUserById, findManyUsers } = require("../services/user.service");
const { findManyRoles, findRoleById, createNewRole, findRoleByIdAndUpdate, findRoleByIdAndDelete } = require("../services/role.service");
const {
	searchBooks, findBookById, createNewBook, findBookByIdAndUpdate, findBookByIdAndDelete, lendBook, returnBook,
} = require("../services/book.service");
const {
	SESSION_DURATION, createNewSession, findSessionByIdAndDelete,
} = require("../services/session.service");

// Runs `fn`, flashes a success or error message, then redirects.
// Used by every form that does something and then goes back to a page.
const formAction = (fn, successMessage, redirectTo) =>
	asyncHandler(async (req, res) => {
		try {
			await fn(req, res);
			setFlash(res, "success", typeof successMessage === "function" ? successMessage(req) : successMessage);
		} catch (err) {
			const duplicate = err.name === "SequelizeUniqueConstraintError";
			setFlash(res, "error", duplicate ? "That username, email or name is already taken." : err.message);
		}
		res.redirect(typeof redirectTo === "function" ? redirectTo(req) : redirectTo);
	});

const checkbox = (value) => value === "on";

/* ---------------------------------------------------------- Home */
const homePage = (req, res) => res.render("home", { title: "Library" });

/* ---------------------------------------------------------- Auth */
const loginPage = (req, res) => {
	if (req.user) return res.redirect("/books");
	res.render("login", { title: "Log in", email: "", error: null });
};

const loginSubmit = (req, res, next) => {
	// Passport only checks email + password; we create the session ourselves.
	passport.authenticate("local", { session: false }, async (err, user) => {
		try {
			const badLogin = err && ["User not found", "Bad Credentials"].includes(err.message);
			if ((err && !badLogin) ) return next(err);
			if (badLogin || !user) {
				return res.status(401).render("login", {
					title: "Log in", email: req.body.email || "", error: "Invalid email or password.",
				});
			}
			const session = await createNewSession(user.id);
			res.cookie("sessionId", session.id, { httpOnly: true, sameSite: "lax", maxAge: SESSION_DURATION });
			setFlash(res, "success", `Welcome back, ${user.username}!`);
			res.redirect("/books");
		} catch (e) {
			next(e);
		}
	})(req, res, next);
};

const signupPage = (req, res) => {
	if (req.user) return res.redirect("/books");
	res.render("signup", { title: "Sign up", values: {}, error: null });
};

const signupSubmit = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;
	const values = { username, email };
	const fail = (error) => res.status(400).render("signup", { title: "Sign up", values, error });

	if (!(username && email && password)) return fail("Username, email and password are required.");
	if (password.length < 6) return fail("Password must be at least 6 characters.");

	try {
		await createNewUser({ username, email, password });
	} catch (err) {
		if (err.name === "SequelizeUniqueConstraintError") return fail("That username or email is already taken.");
		throw err;
	}
	setFlash(res, "success", "Account created. Please log in.");
	res.redirect("/login");
});

const logoutSubmit = asyncHandler(async (req, res) => {
	if (req.cookies.sessionId) await findSessionByIdAndDelete(req.cookies.sessionId);
	res.clearCookie("sessionId");
	setFlash(res, "success", "You have been logged out.");
	res.redirect("/login");
});

/* ------------------------------------------------------- Profile */
const profilePage = (req, res) => res.render("profile", { title: "My profile" });

const profileSubmit = formAction(
	async (req) => {
		const { username, email, password } = req.body;
		if (!(username && email)) throw new Error("Username and email are required.");
		const user = await findUserById(req.user.id);
		user.username = username;
		user.email = email;
		if (password) {
			if (password.length < 6) throw new Error("Password must be at least 6 characters.");
			user.password = password; // hashed by the model hook
		}
		await user.save();
	},
	"Profile updated.",
	"/profile"
);

/* --------------------------------------------------------- Books */
const booksPage = asyncHandler(async (req, res) => {
	const q = (req.query.q || "").trim();
	const books = await searchBooks(q);
	// The "lend to" dropdown is only needed by people who can lend.
	const borrowers = req.can("canLendBooks") ? await findManyUsers({}) : [];
	res.render("books/index", { title: "Books", books, q, borrowers });
});

const newBookPage = (req, res) => res.render("books/form", { title: "Add book", book: null });

const createBookSubmit = formAction(
	async (req) => {
		const { title, author } = req.body;
		if (!(title && author)) throw new Error("Title and author are required.");
		await createNewBook({ title, author });
	},
	(req) => `"${req.body.title}" added.`,
	"/books"
);

const editBookPage = asyncHandler(async (req, res) => {
	const book = await findBookById(req.params.id);
	res.render("books/form", { title: "Edit book", book });
});

const editBookSubmit = formAction(
	async (req) => {
		const { title, author } = req.body;
		if (!(title && author)) throw new Error("Title and author are required.");
		await findBookByIdAndUpdate(req.params.id, { title, author });
	},
	"Book updated.",
	"/books"
);

const deleteBookSubmit = formAction((req) => findBookByIdAndDelete(req.params.id), "Book deleted.", "/books");

const lendBookSubmit = formAction(
	(req) => {
		if (!req.body.userId) throw new Error("Choose who is borrowing the book.");
		return lendBook(req.params.id, req.body.userId);
	},
	"Book lent.",
	"/books"
);

const returnBookSubmit = formAction((req) => returnBook(req.params.id), "Book returned.", "/books");

/* --------------------------------------------------- Admin: users */
const adminUsersPage = asyncHandler(async (req, res) => {
	const users = await findManyUsers({});
	res.render("admin/users", { title: "Users", users });
});

const adminUserEditPage = asyncHandler(async (req, res) => {
	const person = await findUserById(req.params.id);
	const roles = await findManyRoles({});
	res.render("admin/user-edit", {
		title: `Edit ${person.username}`,
		person,
		roles,
		canEditDetails: req.can("canManageUsers"),
		canEditStaff: req.can("canManageStaff") && person.id !== req.user.id, // cannot change your own role
	});
});

const adminUserEditSubmit = formAction(
	async (req) => {
		const person = await findUserById(req.params.id);
		const { username, email, password, roleId, isStaff } = req.body;

		if (req.can("canManageUsers")) {
			if (!(username && email)) throw new Error("Username and email are required.");
			person.username = username;
			person.email = email;
			if (password) {
				if (password.length < 6) throw new Error("Password must be at least 6 characters.");
				person.password = password;
			}
		}
		if (req.can("canManageStaff") && person.id !== req.user.id) {
			if (roleId) await findRoleById(roleId); // throws if the role does not exist
			person.roleId = roleId || null;
			person.isStaff = checkbox(isStaff);
		}
		await person.save();
	},
	"User updated.",
	"/admin/users"
);

/* --------------------------------------------------- Admin: roles */
const permissionFields = ["canLendBooks", "canManageBooks", "canManageStaff", "canManageUsers"];

const rolePermissions = (body) =>
	Object.fromEntries(permissionFields.map((field) => [field, checkbox(body[field])]));

const adminRolesPage = asyncHandler(async (req, res) => {
	const roles = await findManyRoles({});
	res.render("admin/roles", { title: "Roles", roles, permissionFields });
});

const createRoleSubmit = formAction(
	async (req) => {
		if (!req.body.name) throw new Error("Role name is required.");
		await createNewRole({ name: req.body.name.trim(), ...rolePermissions(req.body) });
	},
	"Role created.",
	"/admin/roles"
);

const updateRoleSubmit = formAction(
	async (req) => {
		if (!req.body.name) throw new Error("Role name is required.");
		await findRoleByIdAndUpdate(req.params.id, { name: req.body.name.trim(), ...rolePermissions(req.body) });
	},
	"Role updated.",
	"/admin/roles"
);

const deleteRoleSubmit = formAction(
	async (req) => {
		const inUse = await findManyUsers({ roleId: req.params.id });
		if (inUse.length) throw new Error(`Role is still assigned to ${inUse.length} user(s). Reassign them first.`);
		await findRoleByIdAndDelete(req.params.id);
	},
	"Role deleted.",
	"/admin/roles"
);

module.exports = {
	homePage, loginPage, loginSubmit, signupPage, signupSubmit, logoutSubmit,
	profilePage, profileSubmit,
	booksPage, newBookPage, createBookSubmit, editBookPage, editBookSubmit, deleteBookSubmit, lendBookSubmit, returnBookSubmit,
	adminUsersPage, adminUserEditPage, adminUserEditSubmit,
	adminRolesPage, createRoleSubmit, updateRoleSubmit, deleteRoleSubmit,
};
