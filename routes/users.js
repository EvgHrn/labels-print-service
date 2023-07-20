var express = require('express');
var router = express.Router();
const fs = require('fs');
const pdfPrinter = require("pdf-to-printer");
const printers = require('../utils/printersConst');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/printPackageLabel', function(req, res) {
  try {
    const {location, department, count} = req.body
    const [mediaType, base64Data] = req.body.label.split(',');
    const fileData = Buffer.from(base64Data, 'base64');
    // console.log('location', location)
    // console.log('department', department)
    // console.log('count', count)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomString}`;
   
    fs.writeFile(`public/uploads/${fileName}.pdf`,fileData, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при сохранении файла');
      } else {
        const findRightPrinter = printers.find((el) => el.location === location && el.department === department);
        if(findRightPrinter){
          const options = {
            printer: findRightPrinter.printer,
            // pages: "1-3,5",
            scale: "fit",
            paperSize: 'USER',
            printDialog: false,
            copies: count
          };
          pdfPrinter.print(`public/uploads/${fileName}.pdf`, options)
            .then((result) => {
              console.log('result on printing: ' + result);
            })
            .catch((err) => {
              console.error('error on printing: ' + err);
            })
            .finally(() => {
              fs.unlink(`public/uploads/${fileName}.pdf`, (err) => {
                if (err) console.log(err); // если возникла ошибка    
                else console.log(`${fileName} was deleted`);
              });
            })
        }   
        res.status(200).send('Файл успешно сохранен');
      }
    });
  } catch (error) {
    console.error('Ошибка при печати этикетки:', error);
    // Возвращаем ошибку, если что-то пошло не так
    res.status(500).json({ error: 'Ошибка при печати этикетки' });
  }
});

module.exports = router;
