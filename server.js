const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { router } = require("./routers");
const { pageRouter } = require("./routers/page.router");
const { db } = require("./models");
const { errorHandler } = require("./middleware/error.middleware");
const { loadUser, notFound } = require("./middleware/page.middleware");
const { PORT } = require("./config/env.config");
const { initPassport } = require("./utils/passport.utils");

initPassport(passport);
const app = express();

// EJS templates live in /views, static files (CSS) in /public
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());                          // JSON bodies (API)
app.use(express.urlencoded({ extended: true }));  // HTML form bodies (pages)
app.use(cookieParser());
app.use(passport.initialize());

// JSON API (unchanged)
app.use("/api", router, errorHandler);

// Server-rendered pages
app.use(loadUser);
app.use(pageRouter);
app.use(notFound);

app.listen(PORT, async () => {
	console.log("Server is running on port", PORT);
	await db.authenticate();
	await db.sync(); // creates missing tables. Do NOT use { alter: true } here
});
