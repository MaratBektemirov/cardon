const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

function readFile(file) {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(file)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => {
                resolve(rows);
            })
    })
}

function writeFile(outputFile, headers, rows) {
    const csvWriter = createCsvWriter({
        path: outputFile,
        header: headers
    });

    return csvWriter.writeRecords(rows);
}

function getDate(time) {
    return new Date(time).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    })
}

function progress() {
    let i = 0;

    return {
      finish: (text = '') => {
        if (typeof process.stdout.clearLine === 'function') {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(text);
        }
      },
      next: (text) => {
        let t = '';
  
        if (text) {
          t = ' ' + text;
        }

        if (typeof process.stdout.clearLine === 'function') {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(t);
        }

        i++;
  
        if (i === 4) {
          i = 0;
        }
      }
    }
  }

module.exports = { readFile, writeFile, getDate, progress }