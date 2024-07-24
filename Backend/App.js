const express = require('express');
const mongoose = require('mongoose');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const path = require('path');
const password = require('./utils/password')

// Connexion à la base de données
mongoose.connect('mongodb+srv://vaslin:6eAISq69QeilpZ1j@cluster0.iacezpd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(err => {
    console.error('Connexion à MongoDB échouée !', err);
  });

// Création de l'application
const app = express();
// Middleware permettant à Express d'extraire le corps JSON des requêtes POST
app.use(express.json());

// Middleware gérant les erreurs de CORS
app.use((req, res, next) => {
    // Accès à notre API depuis n'importe quelle origine
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Autorisation d'ajouter les headers mentionnés aux requêtes envoyées vers notre API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // Autorisation d'envoyer des requêtes avec les méthodes mentionnées
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Gestion de la ressource images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

// Enregistrement des routeurs
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);

module.exports = app;