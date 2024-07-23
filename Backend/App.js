const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// MongoDB
mongoose.connect('mongodb+srv://vaslinalex:iuVT1jPVhpoe8Qbo@cluster0.iacezpd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(err => {
        console.error('Connexion à MongoDB échouée !', err);
    });

module.exports = app;
