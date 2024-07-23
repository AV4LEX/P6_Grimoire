const book = require('../models/book');
const fs = require('fs');
const average = require('../util/average');

// POST
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);

    delete bookObject._id;
    delete bookObject._userId;

    const newBook = new book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`,
        averageRating: bookObject.ratings[0].grade
    });

    newBook.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

// GET
exports.getOneBook = (req, res, next) => {
    book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// PUT
exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    book.findOne({ _id: req.params.id })
    .then((existingBook) => {
        if (existingBook.userId != req.auth.userId) {
            res.status(403).json({ message: '403: unauthorized request' });
        } else {
            const fileName = existingBook.imageUrl.split('/images/')[1];
            req.file && fs.unlink(`images/${fileName}`, (err) => {
                if (err) console.log(err);
            });

            existingBook.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error }));
        }
    })
    .catch((error) => {
        res.status(404).json({ error });
    });
};

// DELETE
exports.deleteBook = (req, res, next) => {
    book.findOne({ _id: req.params.id })
    .then(existingBook => {
        if (existingBook.userId != req.auth.userId) {
            res.status(403).json({ message: '403: unauthorized request' });
        } else {
            const fileName = existingBook.imageUrl.split('/images/')[1];
            fs.unlink(`images/${fileName}`, () => {
                existingBook.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                .catch(error => res.status(400).json({ error }));
            });
        }
    })
    .catch(error => res.status(404).json({ error }));
};

// GET
exports.getAllBooks = (req, res, next) => {
    book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json({ error }));
};

// POST
exports.createRating = (req, res, next) => {
    if (0 <= req.body.rating <= 5) {
        const ratingObject = { ...req.body, grade: req.body.rating };

        delete ratingObject.id;

        book.findOne({ _id: req.params.id })
        .then(existingBook => {
            const newRating = existingBook.ratings;
            const userIdArray = newRating.map(rating => rating.userId);

            if (userIdArray.includes(req.auth.userId)) {
                res.status(403).json({ message: 'not authorized' });
            } else {
                newRating.push(ratingObject);

                const grades = newRating.map(rating => rating.grade);
                const averageGrades = average.average(grades);
                existingBook.averageRating = averageGrades;

                existingBook.updateOne({ _id: req.params.id }, { ratings: newRating, averageRating: averageGrades, _id: req.params.id })
                .then(() => res.status(201).json())
                .catch(error => res.status(400).json({ error }));

                res.status(200).json(existingBook);
            }
        })
        .catch(error => res.status(404).json({ error }));
    } else {
        res.status(404).json({ message: 'La note doit être comprise entre 0 et 5' });
    }
};

// GET
exports.getBestRating = (req, res, next) => {
    book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json({ error }));
};
