const asyncHandler = require("express-async-handler");	

const getInfoHandler = asyncHandler(async (req, res) => {
        res.json( { msg: "Hi"});
});	

module.exports = { getInfoHandler };
