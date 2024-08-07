const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Types MIME et extensions acceptés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); 
  },
  
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype] || 'webp'; 
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ storage: storage }).single('image');

module.exports = upload;

module.exports.resizeImage = async (req, res, next) => {
  if (!req.file) { 
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const fileExtension = path.extname(fileName); // Obtenir l'extension du fichier
  const baseName = path.basename(fileName, fileExtension); // Obtenir le nom de base sans extension
  const outputFileName = `opt_resized_${baseName}.webp`; // Nouveau nom de fichier avec extension WebP
  const outputFilePath = path.join('images', outputFileName);

  sharp.cache(false); // Désactiver le cache de sharp
  try {
    await sharp(filePath)
      .resize({ width: 206, height: 260, fit: 'cover' }) // Ajuster selon vos besoins
      .webp({ quality: 100 }) // Ajuster la qualité selon vos besoins
      .toFile(outputFilePath);

    // Supprimer l'image originale
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting original file:', err);
        return next(err);
      }
      req.file.path = outputFilePath;
      req.file.filename = outputFileName;
      req.file.mimetype = 'image/webp'; // Assurez-vous que cela correspond au format de sortie
      console.log('Processed File:', req.file);
      next();
    });
  } catch (err) {
    console.error('Error processing image:', err);
    return next(err);
  }
};
