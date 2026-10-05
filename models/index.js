const Sequelize = require("sequelize");
const { bookModel } = require("./book.model");

const db = new Sequelize({
    host: "127.0.0.1",
	port: "3306",
	password: "root",
	username: "root",
	database: "libraryApi",
	dialect: "mysql",
});

const Book = bookModel(db);

module.exports = { db, Book };