const { Router } = require("express");
const bookRouter = require("./book.router");
const userRouter = require("./user.router");
const roleRouter = require("./role.router");
const adminRouter = require("./admin.router");

const router = Router();

router.use("/books", bookRouter);
router.use("/users", userRouter);
router.use("/roles", roleRouter);
router.use("/admin", adminRouter);

module.exports = { router };