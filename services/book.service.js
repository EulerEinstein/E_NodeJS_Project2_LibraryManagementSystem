
const { Book, User } = require("../models");

const createNewBook = (body) => {
	return Book.create({ ...body });
};

const findManyBooks = (searchParam) => {
	return Book.findAll({ where: { ...searchParam  }});
};

const findBookById = async (id) => {
	const book = await Book.findByPk(id, { include: [User]});
	if (!book) throw new Error("Book with specified id does not exist");
	return book;

};

const findOneBook = (searchParam) => {
	return Book.findOne({ where: { ...searchParam  }});
};

// async is only needed when you want to use await inside the function.
// In your first four functions, you are returning the Promise directly, so you
// don't need async.
// For example, Book.create() is asynchronous and returns a Promise. You can
// simply return that Promise. The async/await version isn't necessary here as
// the effect is similar whether you add async/await or not.

// For below, you need to wait for findBookById(id) to finish before you can
// modify book. Then you need to wait for book.save() to finish before returning
// the updated book. That's why async is useful there.

const findBookByIdAndUpdate = async (id, body) => {
	const book = await findBookById(id);
	// To obtain an array of all of the keys of the object,
	// which is contained in body.
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

module.exports = {
	createNewBook,
    findBookById,
    findOneBook,
    findManyBooks,
    findBookByIdAndUpdate,
    findBookByIdAndDelete,
};
