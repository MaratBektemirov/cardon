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

module.exports = { readFile, writeFile }