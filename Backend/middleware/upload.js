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
  const fileExtension = path.extname(fileName); 
  const baseName = path.basename(fileName, fileExtension); 
  const outputFileName = `opt_resized_${baseName}.webp`; 
  const outputFilePath = path.join('images', outputFileName);

  sharp.cache(false); 
  try {
    await sharp(filePath)
      .resize({ width: 206, height: 260, fit: 'cover' }) 
      .webp({ quality: 100 }) 
      .toFile(outputFilePath);

   
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting original file:', err);
        return next(err);
      }
      req.file.path = outputFilePath;
      req.file.filename = outputFileName;
      req.file.mimetype = 'image/webp'; 
      console.log('Processed File:', req.file);
      next();
    });
  } catch (err) {
    console.error('Error processing image:', err);
    return next(err);
  }
};
