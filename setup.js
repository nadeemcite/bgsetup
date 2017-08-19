const fs = require("fs");
const fsPath = require("fs-path");
const rjobfiles=require('./readjobfiles');
var outDir = __dirname + '/out';
function logError(msg) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fs.appendFile(__dirname + '/setuplog.txt', "\n" + msg, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve('Success');
                }
            });
        }, 2000);
    });
}
function settle(unique_key, file) {
    return new Promise((resolve, reject) => {        
            if (file == "job_history") {
                rjobfiles.readJobHistoryFolder(unique_key).then((data)=>{
                    resolve(data);
                },(error)=>{                    
                    resolve(error);
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
                        });
                        var json2csv = require('json2csv');
                        var csv = json2csv({ data: mappedData, fields: keys, hasCSVColumnTitle: false, eol: '\n' });
                        fsPath.writeFile(__dirname + '/out/' + file + '/' + unique_key + '.csv', csv, function (err) {
                            if (err) reject(err);
                            resolve('success');
                        });
                    }else{
                        reject('error no proper data '+unique_key);
                        console.log('-Invalid JSON at ' + unique_key + '/' + file)
                        logError('-Invalid JSON at ' + unique_key + '/' + file);    
                    }
                } catch (e) {
                    reject('error parsing data '+unique_key);
                    console.log('Invalid JSON at ' + unique_key + '/' + file)
                    logError('Invalid JSON at ' + unique_key + '/' + file);
                }
            }
        
    });
}
fs.readdir(__dirname + '/explore', function (err, items) {
    var promiseArray=[];
    var promises=items.map((unique_key) => {
        return new Promise((resolve,reject)=>{            
            console.log('Processing ' + unique_key);
            var in_pr=[
                settle(unique_key, 'HistoryHDR.json'),
                settle(unique_key, 'HistoryMaster'),
                settle(unique_key, 'NewCustomerVehicleDetails'),
                settle(unique_key, 'job_history')
            ];
            var final=in_pr.reduce((prev,now)=>{
                if(prev){
                    return prev.then(()=>{
                        return now;
                    },(d)=>{
                        return now;
                    })
                }else{
                    return now;
                }
            },null);
            final.then(()=>{
                resolve('done');
            },(d)=>{                
                console.log('handled '+d)
                resolve('done');
            })
        });
    });
    var finalFilePromise=promises.reduce((prev,now)=>{
        if(prev){
           return prev.then(()=>{
                return now;
            },()=>{
                return now;
            })
        }else{
            return now;
        }
    },null);
    finalFilePromise.then(()=>{
        console.log('done');
    },()=>{
        console.log('done');
    })
});