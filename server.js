const express = require("express"); 
const { router } = require("./routers");
const { db } = require("./models");
const { errorHandler } = require("./middleware/error.middleware");
const { PORT, SESSION_SECRET } = require("./config/env.config");
const passport = require("passport");
const { initPassport } = require("./utils/passport.utils");
const cookieParser = require("cookie-parser");


initPassport(passport);
const app = express(); 

app.use(express.json()); 
app.use(cookieParser());
app.use(passport.initialize()); // Initialize passport

// Register route after the passport configuration
app.use("/api", router);
app.use(errorHandler);

app.listen(PORT, async () => { 
    console.log("Server is running on port", PORT); 
    await db.sync();
    db.authenticate()
}); 