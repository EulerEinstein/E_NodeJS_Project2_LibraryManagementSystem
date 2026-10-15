const errorHandler = (err, req, res, next) => {
	// keep the status set by the controller/middleware (401, 403...), default to 500
	const code = res.statusCode >= 400 ? res.statusCode : 500;
	res.status(code).json({
		Error: {
			Code: code,
			message: err.message
		}
	})
};

// export to server.js
module.exports = { errorHandler };
