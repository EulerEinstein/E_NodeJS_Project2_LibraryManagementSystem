// Middleware used only by the EJS pages (the /api routes keep using
// access-control.middleware.js and answer with JSON).
const { findSessionById } = require("../services/session.service");

// Flash message = a short-lived cookie that is shown once on the next page.
const setFlash = (res, type, message) => {
	res.cookie("flash", JSON.stringify({ type, message }), { maxAge: 10000, httpOnly: true, sameSite: "lax" });
};

// Runs on EVERY page request. It never blocks: it only
//  1. finds the logged-in user (from the sessionId cookie) and puts it in req.user
//  2. exposes `user`, `can()` and `flash` to every EJS template via res.locals
const loadUser = async (req, res, next) => {
	try {
		req.user = null;
		const session = await findSessionById(req.cookies.sessionId);
		if (session && session.expiresAt > new Date()) {
			req.user = session.User; // includes Role
		} else if (session) {
			await session.destroy();
			res.clearCookie("sessionId");
		}

		// can("canManageBooks") -> true only for staff whose Role allows it
		const can = (permission) => !!(req.user?.isStaff && req.user?.Role?.[permission]);
		req.can = can;
		res.locals.user = req.user;
		res.locals.can = can;
		res.locals.currentPath = req.path;

		res.locals.flash = null;
		if (req.cookies.flash) {
			try { res.locals.flash = JSON.parse(req.cookies.flash); } catch { /* ignore bad cookie */ }
			res.clearCookie("flash");
		}
		next();
	} catch (err) {
		next(err);
	}
};

const forbidden = (res) => res.status(403).render("error", { title: "Forbidden", code: 403, message: "You do not have permission to view this page." });

const requireLogin = (req, res, next) => {
	if (req.user) return next();
	setFlash(res, "error", "Please log in first.");
	res.redirect("/login");
};

// requirePermission("canManageBooks") or requirePermission("canManageUsers", "canManageStaff") (any of them)
const requirePermission = (...permissions) => (req, res, next) => {
	if (!req.user) {
		setFlash(res, "error", "Please log in first.");
		return res.redirect("/login");
	}
	if (permissions.some((p) => req.can(p))) return next();
	forbidden(res);
};

const notFound = (req, res) => {
	res.status(404).render("error", { title: "Not found", code: 404, message: "That page does not exist." });
};

// Error page for anything thrown inside a page route.
const pageErrorHandler = (err, req, res, next) => {
	if (res.headersSent) return next(err);
	const missing = /does not exist/i.test(err.message);
	const code = missing ? 404 : err.status || (res.statusCode >= 400 ? res.statusCode : 500);
	res.status(code).render("error", { title: "Error", code, message: err.message });
};

module.exports = { setFlash, loadUser, requireLogin, requirePermission, notFound, pageErrorHandler };
