const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');

const directoryPath = path.join(__dirname, 'images');

const files = fs.readdirSync(directoryPath);

files.forEach(file => {
  const filePath = path.join(directoryPath, file);
  const fileExt = path.extname(file);

  if (fileExt === '.heic') {
    console.log(`Converting ${file} to JPEG`);

    // Read the HEIC file and convert it to JPEG
    const heicBuffer = fs.readFileSync(filePath);
    heicConvert({
        buffer: heicBuffer,
        format: 'JPEG'
      })
      .then(jpegBuffer => {
        // Write the JPEG file to disk
        const jpegFilePath = path.join(directoryPath, `${file.slice(0, -5)}.jpg`);
        fs.writeFileSync(jpegFilePath, jpegBuffer);
        console.log(`Converted ${file} to JPEG`);
      })
      .catch(err => {
        console.error(`Error converting ${file}: ${err}`);
      });
  }
});
