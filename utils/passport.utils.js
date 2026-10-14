// passport → handles authentication and sessions.
// passport-local → gives you the Local Strategy, which authenticates 
// using something like email + password.
// bcryptjs → compares the password the user entered against the
// hashed password stored in the database.
// findOneUser → own custom function for finding a user in the
// database.

const Passport = require("passport"); 
const Strategy = require("passport-local");
const bcrypt = require("bcryptjs");
const { findOneUser, findUserById } = require("../services/user.service");

// function to configure passport
const initPassport = (passport) => { 
	
    // email - what the user entered
    // password - what the user entered
    // cb - callback to tell Passport what happened
    // const authenticate -  Passport Local Strategy will call this
    // function when someone to log in.
    const authenticate = async (email, password, cb) => {
        const user = await findOneUser({ email }).catch((err) => cb(err));
        if(!user) cb(Error("User not found"));
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) cb(Error("Bad Credentials"));
        
        // Successful authentication
        return cb(null, user);
    }
	
    // Connecting the const authenticate function to Passport
    // "Use this Local Strategy for authentication, and when you need
    // to authenticate someone, use my authenticate function."
    passport.use(new Strategy({ usernameField: "email" }, authenticate));

    // Get into sessions
    // After successful login, Passport asks:
    //"What information should I store in the session?"
    // You tell it: user.id
    // So Passport stores user id e.g. 123 rather than storing the 
    // entire user object.
    passport.serializeUser((user, cb) => {
        return cb(null, user.id);
    });
					
    // Later, the user makes another request e.g. GET/profile.
    // Passport sees that the session contains user id e.g. 123.
    // Now Passport needs to turn id 123 back into the user object.
    passport.deserializeUser(async (id, cb) => {
        const user = await findUserById(id);
        return cb(null, user);
    });
};
				

// export using curly bracket is called named export. It’s used to 
// export function
module.exports = { initPassport};
