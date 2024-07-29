const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); 
  },
  
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype] || 'webp'; // Par défaut à 'webp'
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('image');

module.exports.resizeImage = (req, res, next) => {
  if (!req.file) { // Utiliser req.file pour un fichier unique
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  // Utilisez le préfixe souhaité ici
  const outputFilePath = path.join('images', `opt_resized_${fileName}`);

  console.log('File Path:', filePath);
  console.log('Output File Path:', outputFilePath);

  sharp(filePath)
    .resize({ width: 206, height: 260 })
    .webp()
    .toFile(outputFilePath)
    .then(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting original file:', err);
          return next(err);
        }
        req.file.path = outputFilePath;
        req.file.filename = `resized_${fileName}`;
        req.file.mimetype = 'image/png';
        console.log('Processed File:', req.file);
        next();
      });
    })
    .catch(err => {
      console.error('Error processing image:', err);
      return next(err);
    });
};
