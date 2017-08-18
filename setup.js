const fs = require("fs");
const fsPath = require("fs-path");
var outDir = __dirname + '/out';
function logError(msg){
    fs.readFile('./setuplog.txt', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data+"\n"+msg;
        fs.writeFile('./setuplog.txt', result, 'utf8', function (err) {
           if (err) return console.log(err);
        });
      });
}
function settle(unique_key, file) {
    if (file == "job_history") {
        var tables = {
            'FOLLOWUP': [],
            'P': [],
            'L': [],
            'D': []
        }
        fs.readdir(__dirname + '/explore/' + unique_key + '/job_history', function (err, files) {
            files.forEach(file => {
                
                try {
                    var text = fs.readFileSync(__dirname + '/explore/' + unique_key + '/job_history/' + file, 'utf-8');
                    var targetData = JSON.parse(text);
                    if (targetData) {

                        var fArray = targetData.FOLLOWUP.map(function (r) {
                            r.fileName = file;
                            r.unique_key = unique_key;
                            return r;
                        });
                        console.lo
                        tables.FOLLOWUP = tables.FOLLOWUP.concat(fArray);
                        var pArray = targetData.P.map(function (r) {
                            r.fileName = file;
                            r.unique_key = unique_key;
                            return r;
                        });
                        tables.P = tables.P.concat(pArray);
                        var lArray = targetData.L.map(function (r) {
                            r.fileName = file;
                            r.unique_key = unique_key;
                            return r;
                        });
                        tables.L = tables.L.concat(lArray);
                        var dArray = targetData.D.map(function (r) {
                            r.fileName = file;
                            r.unique_key = unique_key;
                            return r;
                        });
                        tables.D = tables.D.concat(dArray);
                    }
                } catch (e) {
                    console.log('Invalid JSON at ' + unique_key + '/job_history/' + file)
                    logError('Invalid JSON at ' + unique_key + '/job_history/' + file);
                }

            });
            for (let key in tables) {
                if (tables[key].length > 0) {
                    var keys = Object.keys(tables[key][0]);
                    var hText = keys.join(":string,") + ":string";
                    fsPath.writeFile(__dirname + '/heads/' + key + '.txt', hText, function (err) {
                        if (err) throw err;
                        11111
                    });
                    var json2csv = require('json2csv');
                    var csv = json2csv({ data: tables[key], fields: keys, hasCSVColumnTitle: false, eol: '\n' });
                    fsPath.writeFile(__dirname + '/out/job_history/' + key + '/' + unique_key + '.csv', csv, function (err) {
                        if (err) throw err;
                        11111
                    });
                }
            }
        });




    } else {
        var targetFile = __dirname + '/explore/' + unique_key + '/' + file;
        
        try {
            var text = fs.readFileSync(targetFile, 'utf-8');
            var jsonFormat = JSON.parse(text);
            var targetData = null;
            switch (file) {
                case 'HistoryHDR.json':
                    targetData = jsonFormat.HHDR;
                    break;
                case 'HistoryMaster':
                    targetData = jsonFormat.PS;
                    break;
                case 'NewCustomerVehicleDetails':
                    targetData = [jsonFormat];
                    break;
            }

            if (targetData) {
                var mappedData = targetData.map((row) => {
                    row.unique_key = unique_key;
                    return row;
                });
                var keys = Object.keys(mappedData[0]);
                var hText = keys.join(":string,") + ":string"
                fsPath.writeFile(__dirname + '/heads/' + file + '.txt', hText, function (err) {
                    if (err) throw err;
                    11111
                });
                var json2csv = require('json2csv');
                var csv = json2csv({ data: mappedData, fields: keys, hasCSVColumnTitle: false, eol: '\n' });
                fsPath.writeFile(__dirname + '/out/' + file + '/' + unique_key + '.csv', csv, function (err) {
                    if (err) throw err;
                    11111
                });
            }
        } catch (e) {
            console.log('Invalid JSON at ' + unique_key + '/' + file)
            logError('Invalid JSON at ' + unique_key + '/' + file);
        }

    }


}
fs.readdir(__dirname + '/explore', function (err, items) {
    items.forEach((unique_key) => {


        settle(unique_key, 'HistoryHDR.json');
        settle(unique_key, 'HistoryMaster');
        settle(unique_key, 'NewCustomerVehicleDetails');
        settle(unique_key, 'job_history');
        console.log('Processing ' + unique_key);



    });
});