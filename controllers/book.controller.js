const asyncHandler = require("express-async-handler");
const { createNewBook, findManyBooks, findBookByIdAndUpdate, findBookByIdAndDelete, lendBook, returnBook } = require("../services/book.service");

const createBookHandler = asyncHandler(async (req, res) => {
	const { title, author } = req.body;
	const book = await createNewBook({ title, author });
	res.status(201).json(book);
});

const getManyBooksHandler = asyncHandler(async (req, res) => {
	// spread operator enables an entire search and filtering right into our URL
	// see part c)
	const books = await findManyBooks({ ...req.query }); 
	res.json(books);
});

const updateBookHandler = asyncHandler(async (req, res) => {
	const { title, author } = req.body;
    const book = await findBookByIdAndUpdate(req.params.id, { title, author }); 
	res.status(202).json(book);
});

const deleteBookHandler = asyncHandler(async (req, res) => {
	const book = await findBookByIdAndDelete( req.params.id ); 
	res.status(202).json(book);
});


const bookLendingHandler = asyncHandler(async (req, res) => {
	const { action, userId: borrowerId } = req.body;
	if (!["lend", "return"].includes(action) || (action === "lend" && !borrowerId))
		throw new Error("Bad request, action (lend or return) is required, and userId for lend");

	const book = action === "lend" ? await lendBook(req.params.id, borrowerId) : await returnBook(req.params.id);
	res.status(202).json(book);
});

module.exports = {
	bookLendingHandler, 
    createBookHandler, 
    getManyBooksHandler, 
    updateBookHandler, 
    deleteBookHandler 
};