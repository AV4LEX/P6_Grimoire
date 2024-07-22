const book = require('../models/book');

//POST
exports.createBook = (req, res, next) => {

    const BOOK_OBJECT = JSON.parse(req.body.book);

    delete BOOK_OBJECT._id;

    delete BOOK_OBJECT._userId;

    const BOOK = new book({
        ...BOOK_OBJECT,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`,
        averageRating: BOOK_OBJECT.ratings[0].grade
    });

    BOOK.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !'}) })
    .catch(error => { res.status(400).json( { error }) })
};