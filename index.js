const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const directoryPath = path.join(__dirname, 'images');
const resPath = path.join(__dirname, 'resultsimages');
const Jimp = require('jimp') ;
const { basename } = require('path');
const heicConvert = require('heic-convert');

const file = path.join(__dirname, 'data.csv');

async function readCSV(filePath) {
    return new Promise((resolve) => {
        const jsonData = []
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                jsonData.push({
                    image: data['PHOTO FILE NAME'].split('.')[0],
                    person: `${data['SURNAME']}_${data['NAME']}`.toLocaleLowerCase().replaceAll(' ', '_').replaceAll("'", ''),
                    file: path.join(directoryPath,  data['PHOTO FILE NAME'].replaceAll(' ', '')),
                    text: `${data['NAME']} ${data['SURNAME']}: ${data['POSITION']}`
                });
            })
            .on('end', () => {
                console.log(`Converted ${jsonData.length} rows to JSON`);
                resolve(jsonData)
            });

    })
} 

// 3024 x 4032

async function run () {
   const personData = await readCSV(file)
   const files = fs.readdirSync(directoryPath).map(v => path.join(directoryPath, v)).filter( v => path.extname(v) === '.jpg' ||  path.extname(v) === '.heic')
   const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
   const total = personData.length
   let count = 1
   for(const p of personData) {

    try {

        const heicBuffer = fs.readFileSync(p.file);
        const jpegBuffer = await heicConvert({
            buffer: heicBuffer,
            format: 'JPEG'
        })
        const image = await Jimp.read(jpegBuffer);
        image.resize(Jimp.AUTO, 4032)
        image.crop((image.bitmap.width-3024)/2 ,0, 3024, 4032)
        const baseName = path.basename(file)
        
        const textInfo =  {
            text: p.text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP,
          }
        image.print(font, 0, 50, textInfo, image.bitmap.width, image.bitmap.height);
        // Writing image after processing
        await image.writeAsync(path.join(resPath, `${p.person}.jpg` ));
        console.log(`Done ${count} of ${total}: ${p.person}`)
        count++
        
    } catch (error) {
        console.log(error)
    }
        
    }
}


run()


