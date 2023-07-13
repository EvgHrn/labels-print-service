var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


const jsPDF = require("jspdf");

// Default export is a4 paper, portrait, using millimeters for units



const pdfPrinter = require("pdf-to-printer");

// pdfPrinter.getPrinters().then(console.log);

const options = {
  printer: "TSC DA220 centr",
  // pages: "1-3,5",
  scale: "fit",
  paperSize: 'USER',
  printDialog: false,
  copies: 3
};

// pdfPrinter.print("./Test.pdf", options)
//   .then((result) => {
//     console.log('result on printing: ' + result);
//   })
//   .catch((err) => {
//     console.error('error on printing: ' + err);
//   })



const htmlStr = '<div>Hello</div>';

try {
  const doc = new jsPDF.jsPDF();
  doc.html(htmlStr, {
    callback: function (doc) {
      console.log(`pdf created`);
      doc.save();
    },
    x: 10,
    y: 10
  });
} catch(e) {
  console.error('error on pdf creating: ' + e);
}

module.exports = app;
