const { Router } = require("express");
const bookRouter = require("./book.router");
const userRouter = require("./user.router");

const router = Router();

router.use("/books", bookRouter);
router.use("/users", userRouter);

module.exports = { router };