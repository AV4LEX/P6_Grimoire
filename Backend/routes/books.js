const EXPRESS = require('express');
const ROUTER = EXPRESS.Router();

const BOOK_CT = require('../controller/Books');


ROUTER.get('/', BOOK_CT.getAllBooks);
ROUTER.get('/bestrating', BOOK_CT.getBestRating);
ROUTER.get('/:id', BOOK_CT.getOneBook);
ROUTER.post('/', auth, upload, upload.resizeImage, BOOK_CT.createBook);
ROUTER.post('/:id/rating', auth, BOOK_CT.createRating);
ROUTER.put('/:id', auth, upload, upload.resizeImage, BOOK_CT.modifyBook);
ROUTER.delete('/:id', auth, BOOK_CT.deleteBook);

module.exports = ROUTER;