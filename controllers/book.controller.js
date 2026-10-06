const asyncHandler = require("express-async-handler");
const { createNewBook, findManyBooks, findBookByIdAndUpdate, findBookByIdAndDelete } = require("../services/book.service");

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


module.exports = { 
    createBookHandler, 
    getManyBooksHandler, 
    updateBookHandler, 
    deleteBookHandler 
};