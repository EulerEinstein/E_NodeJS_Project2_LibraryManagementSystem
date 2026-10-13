const { Router  } = require("express");
const { 
    createBookHandler, 
    getManyBooksHandler, 
    updateBookHandler, 
    deleteBookHandler, 
    bookLendingHandler
} = require("../controllers/book.controller");
const { 
    isAuthenticated, 
    isStaff, 
    hasPermission 
} = require("../middleware/access-control.middleware");

const router  = Router();

router.route("/")
    .post(isAuthenticated, isStaff, hasPermission("canManageBooks"), createBookHandler)
    .get(isAuthenticated, isStaff, hasPermission("canLendBooks"), getManyBooksHandler);

router.route("/:id")
    .patch(isAuthenticated, isStaff, hasPermission("canManageBooks"), updateBookHandler)
    .delete(isAuthenticated, isStaff, hasPermission("canManageBooks"), deleteBookHandler);
    
router.route("/:id/lend")
    .patch(hasPermission("canLendBooks"), bookLendingHandler);

module.exports =  router;
