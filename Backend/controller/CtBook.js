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

//GET

exports.getOneBook = (req, res, next) => {
    book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
}

//PUT
exports.modifyBook = (req, res, next) => {

    const BOOK_OBJECT = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
    } : { ...req.body };

    delete BOOK_OBJECT._userId;

    book.findOne({_id: req.params.id})
    .then((book) => {
        if(book.userId != req.auth.userId) {
            res.status(403).json({ message : '403: unauthorized request' });
        }else{

            const FILE_NAME = book.imageUrl.split('/images/')[1];
            req.file && FileSystem.unlink(`images/${FILE_NAME}`, (err => {
                    if (err) console.log(err);
                })
            );
        

            book.updateOne({ _id: req.params.id }, { ...BOOK_OBJECT, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.staus(400).json({ error }));
        }
    })
    .catch((error) => {
        res.status(404).json({ error });
    });
};

//DELETE

exports.deleteBook = (req, res, next) => {
    book.findOne({ _id: req.params.id })
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(403).json({ message: '403: unauthorized request'});
        } else {
            const FILE_NAME = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${FILE_NAME}`, () => {
                book.deleteOne({ _id: req.params.id })
                .then(() => { res.status(200).json({ message: 'Objet Suprimé !'}) })
                .catch(error => res.status(400).json({ error }));
            })
        }

    })
    .catch( error => {
        res.status(404).json({ error });
    });
};

//GET
exports.getAllBooks = (req, res, next) => {
    book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json({ error }));
};