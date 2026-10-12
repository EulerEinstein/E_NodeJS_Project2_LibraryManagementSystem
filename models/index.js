const Sequelize = require("sequelize");
const { bookModel } = require("./book.model");
const { userModel } = require("./user.model");
const { roleModel } = require("./role.model");
const { DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_PASS } = require("../config/env.config");

const db = new Sequelize ({ 
	host: DB_HOST,
	port: DB_PORT,
	password: DB_PASS,
	username: DB_USER,
	database: DB_NAME,
	dialect: "mysql",
});

const Book = bookModel(db);
const User = userModel(db);
const Role = roleModel(db);

Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

module.exports = { db, Book, User, Role };