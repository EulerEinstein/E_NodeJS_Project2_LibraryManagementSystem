const { Op } = require("sequelize");
const { Book, User } = require("../models");
const { findUserById } = require("./user.service");

const createNewBook = (body) => {
	return Book.create({ ...body });
};

const findManyBooks = (searchParam) => {
	return Book.findAll({ where: { ...searchParam  }});
};

const findBookById = async (id) => {
	const book = await Book.findByPk(id);
	if (!book) throw new Error("Book with specified id does not exist");
	return book;

};

const findOneBook = (searchParam) => {
	return Book.findOne({ where: { ...searchParam  }});
};

const findBookByIdAndUpdate = async (id, body) => {
	const book = await findBookById(id);
	for (const key of Object.keys(body)) {
		book[key] = body[key] ?? book[key];
	};

	await book.save();
	return book;
};

const findBookByIdAndDelete = async (id) => {
	const book = await findBookById(id);
	await book.destroy();
	return book;
};

// Used by the pages: search by title or author, and include who borrowed the book.
const searchBooks = (q) => {
	const where = q ? { [Op.or]: [{ title: { [Op.like]: `%${q}%` } }, { author: { [Op.like]: `%${q}%` } }] } : {};
	return Book.findAll({
		where,
		include: [{ model: User, as: "borrower", attributes: ["id", "username"] }],
		order: [["title", "ASC"]],
	});
};

const lendBook = async (id, borrowerId) => {
	const book = await findBookById(id);
	if (!book.isAvailable) throw new Error("Book is not available");
	await findUserById(borrowerId); // throws if the user does not exist
	book.borrowerId = borrowerId;
	book.isAvailable = false;
	await book.save();
	return book;
};

const returnBook = async (id) => {
	const book = await findBookById(id);
	if (book.isAvailable) throw new Error("Book is not currently lent");
	book.borrowerId = null;
	book.isAvailable = true;
	await book.save();
	return book;
};

module.exports = {
	searchBooks,
	lendBook,
	returnBook,
	createNewBook,
    findBookById,
    findOneBook,
    findManyBooks,
    findBookByIdAndUpdate,
    findBookByIdAndDelete,
};
