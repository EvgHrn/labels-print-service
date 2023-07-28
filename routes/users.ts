var express = require('express');
var router = express.Router();
var fs = require('fs');
var pdfPrinter = require("pdf-to-printer");
var printers = require('../utils/printersConst');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/printPackageLabel', function(req, res) {
  console.log(`${new Date().toLocaleString('ru')} New label with body:`, req.body);
  try {
    const {location, department, count} = req.body
    const [mediaType, base64Data] = req.body.label.split(',');
    const fileData = Buffer.from(base64Data, 'base64');
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomString}`;

    fs.writeFile(`public/uploads/${fileName}.pdf`,fileData, (err) => {
      if(err) {
        console.error(`${new Date().toLocaleString('ru')} Writing pdf error:`, err);
        res.status(500).send('Ошибка при сохранении файла');
      } else {
        const findRightPrinter = printers.find((el) => el.location === location && el.department === department);
        if(findRightPrinter) {
          const options = {
            printer: findRightPrinter.printer,
            scale: "fit",
            paperSize: '56x98',
            printDialog: false,
            copies: count
          };
          pdfPrinter.print(`public/uploads/${fileName}.pdf`, options)
            .then((result) => {
              console.log(`${new Date().toLocaleString('ru')} result on printing: ` + result);
            })
            .catch((err) => {
              console.error(`${new Date().toLocaleString('ru')} error on printing: ` + err);
            })
            .finally(() => {
              fs.unlink(`public/uploads/${fileName}.pdf`, (err) => {
               if (err) console.error(`${new Date().toLocaleString('ru')} Delete pdf error:`, err); // если возникла ошибка
               else console.log(`${fileName} was deleted`);
              });
            })
        } else {
          res.status(500).send('Принтер не найден');
        }
        res.status(200).send('Файл успешно сохранен');
      }
    });
  } catch (error) {
    console.error(`${new Date().toLocaleString('ru')} Error:`, error);
    // Возвращаем ошибку, если что-то пошло не так
    res.status(500).json({ error: 'Ошибка при печати этикетки' });
  }
});

module.exports = router;
