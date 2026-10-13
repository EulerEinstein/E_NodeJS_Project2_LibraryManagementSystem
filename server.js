const express = require("express"); 
const { router } = require("./routers");
const { db, Book } = require("./models");
const { errorHandler } = require("./middleware/error.middleware");
const { PORT, SESSION_SECRET } = require("./config/env.config");
const session = require("express-session");
const passport = require("passport");
const { initPassport } = require("./utils/passport.utils");


initPassport(passport);
const app = express(); 

app.use(express.json()); 


// Creating session middleware: important connection between Express
// sessions and Passport sessions.
// secret - the secret used to sign the session ID/cookie.
// resave: false – Tells express: “Don't save the session back to the
// session store if nothing changed.”
// saveUninitialized: false – Tells express: "Don't create/save a session 
// for someone who hasn't actually used a session."
app.use(
	session({ 
        secret: SESSION_SECRET, 
        resave: false, 
        saveUninitialized: false 
    })
);
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Connects passport to the express session

// Register route after the passport configuration
app.use("/api", router);
app.use(errorHandler);

app.listen(PORT, async () => { 
    console.log("Server is running on port", PORT); 
    await db.sync();
    db.authenticate()
}); 