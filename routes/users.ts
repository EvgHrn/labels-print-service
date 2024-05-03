var express = require('express');
var router = express.Router();
const fs = require('fs');
const pdfPrinter = require("pdf-to-printer");
const printersToPrint = require('../utils/printersConst')

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/printPackageLabel', function(req, res) {
  console.log(`${new Date().toLocaleString('ru')} New label with:`, req.body.location, req.body.department, req.body.count);
  try {
    const {location, department, count, fromTimer} = req.body
    // console.log('req.body', req.body)
    const [mediaType, base64Data] = req.body.label.split(',');
    const fileData = Buffer.from(base64Data, 'base64');
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomString}`;

    fs.writeFile(`public/uploads/${fileName}.pdf`,fileData, (err) => {
      if(err) {
        console.error(`${new Date().toLocaleString('ru')} Writing pdf error:`, err);
        res.status(500).send('Ошибка при сохранении файла');
        return;
      } else {
        const findRightPrinter = printersToPrint.find((el) => el.location === location && el.department === department);
        if(findRightPrinter) {
          pdfPrinter.getPrinters()
            .then((printers) => {
              // {
              //   deviceId: 'TSC DA220 nagradka sklad C',
            //     name: 'TSC DA220 nagradka sklad C',
              //   paperSizes: [ 'USER', '2 x 4', '4 x 4', '4 x 6' ]
              // },
              console.log(`${new Date().toLocaleString('ru')} Printers: `, printers);
              return printers.some((printer: {deviceId: string, name: string, paperSizes: string[]}) => printer.name === findRightPrinter.printer);
            })
            .then((isTherePrinter: boolean) => {

              if(!isTherePrinter) {
                console.error(`${new Date().toLocaleString('ru')} Printer not find with:`, location, department, findRightPrinter.printer);
                res.status(500).send(`Принтер ${findRightPrinter.printer} не найден`);
                return;
              } else {
                console.log(`${new Date().toLocaleString('ru')} Printer found ${findRightPrinter.printer}`);
              }

              const options: any = {
                printer: findRightPrinter.printer,
                scale: "fit",
                paperSize: findRightPrinter.paperSize,
                printDialog: false,
                copies: 1
              };

              if('orientation' in findRightPrinter) {
                options.orientation = findRightPrinter.orientation;
              }

              res.status(200).end();

              pdfPrinter.print(`public/uploads/${fileName}.pdf`, options)
                .then((result) => {
                  console.log(`${new Date().toLocaleString('ru')} Printing result: `, result);
                  res.status(200).end();
                  return;
                })
                .catch((err) => {
                  console.error(`${new Date().toLocaleString('ru')} Printing error: `, err);
                  res.status(500).send(`Ошибка печати`);
                  return;
                })
                .finally(() => {
                  fs.unlink(`public/uploads/${fileName}.pdf`, (err) => {
                    if (err) console.error(`${new Date().toLocaleString('ru')} Delete pdf error:`, err); // если возникла ошибка
                    else console.log(`${new Date().toLocaleString('ru')} ${fileName} was deleted`);
                  });
                })
            })
            .catch((e) => {
              console.error(`${new Date().toLocaleString('ru')} Printer error:`, e);
              res.status(500).send('Ошибка печати этикетки: ошибка получения списка принтеров');
              return;
            });
        } else {
          console.error(`${new Date().toLocaleString('ru')} Printer not find with:`, location, department);
          res.status(500).send('Принтер не найден');
          return;
        }
      }
    });
  } catch (error) {
    console.error(`${new Date().toLocaleString('ru')} Error:`, error);
    // Возвращаем ошибку, если что-то пошло не так
    res.status(500).send('Ошибка печати этикетки');
    return;
  }
});

module.exports = router;
