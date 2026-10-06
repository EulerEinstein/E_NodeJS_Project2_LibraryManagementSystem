const errorHandler = (err, req, res, next) => {
	res.json({
		Error: {
			Code: 500,
			message: err.message
		}
	})
};

// export to server.js
module.exports = { errorHandler };
