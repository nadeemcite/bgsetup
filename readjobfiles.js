var fs = require('fs');
var fsPath = require('fs-path');
var json2csv = require('json2csv');
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
var appObj = {
    readSingle: (file, unique_key) => {
        return new Promise((resolve, reject) => {
            try {
                var returnObj = {};
                var text = fs.readFileSync(__dirname + '/explore/' + unique_key + '/job_history/' + file, 'utf-8');
                var targetData = JSON.parse(text);
                if (targetData) {
                    var fArray = targetData.FOLLOWUP.map(function (r) {
                        r.fileName = file;
                        r.unique_key = unique_key;
                        return r;
                    });
                    returnObj.FOLLOWUP = fArray;
                    var pArray = targetData.P.map(function (r) {
                        r.fileName = file;
                        r.unique_key = unique_key;
                        return r;
                    });
                    returnObj.P = pArray;
                    var lArray = targetData.L.map(function (r) {
                        r.fileName = file;
                        r.unique_key = unique_key;
                        return r;
                    });
                    returnObj.L = lArray;
                    var dArray = targetData.D.map(function (r) {
                        r.fileName = file;
                        r.unique_key = unique_key;
                        return r;
                    });
                    returnObj.D = dArray;
                    resolve(returnObj);
                } else {
                    console.log('Invalid JSON at ' + unique_key + '/job_history/' + file)
                    logError('Invalid JSON at ' + unique_key + '/job_history/' + file);
                    reject('error job history ' + unique_key + '/' + file);
                }
            } catch (e) {
                console.log('Invalid JSON at ' + unique_key + '/job_history/' + file)
                logError('Invalid JSON at ' + unique_key + '/job_history/' + file);
                reject('error job history ' + unique_key + '/' + file);
            }
        });
    },
    readJobHistoryFolder: (unique_key) => {
        return new Promise((resolve, reject) => {
            var tables = {
                'FOLLOWUP': [],
                'P': [],
                'L': [],
                'D': []
            }
            fs.readdir(__dirname + '/explore/' + unique_key + '/job_history', function (err, files) {
                if (err) {
                    reject('error');
                } else if (files && files.length > 0) {
                    var final = files.reduce((prev, now) => {
                        if (prev) {
                            return prev.then((obj) => {
                                tables.FOLLOWUP = obj.FOLLOWUP ? tables.FOLLOWUP.concat(obj.FOLLOWUP) : tables.FOLLOWUP;
                                tables.P = obj.P ? tables.P.concat(obj.P) : tables.P;
                                tables.L = obj.L ? tables.L.concat(obj.L) : tables.L;
                                tables.D = obj.D ? tables.D.concat(obj.D) : tables.D;
                                return appObj.readSingle(now, unique_key);
                            }, (error) => {
                                return appObj.readSingle(now, unique_key);
                            })
                        } else {
                            return appObj.readSingle(now, unique_key);
                        }
                    }, null);
                    final.then((obj) => {
                        tables.FOLLOWUP = obj.FOLLOWUP ? tables.FOLLOWUP.concat(obj.FOLLOWUP) : tables.FOLLOWUP;
                        tables.P = obj.P ? tables.P.concat(obj.P) : tables.P;
                        tables.L = obj.L ? tables.L.concat(obj.L) : tables.L;
                        tables.D = obj.D ? tables.D.concat(obj.D) : tables.D;
                        var promiseArray = [];
                        for (let key in tables) {
                            if (tables[key].length > 0) {
                                var keys = Object.keys(tables[key][0]);
                                var hText = keys.join(":string,") + ":string";
                                fsPath.writeFile(__dirname + '/heads/' + key + '.txt', hText, function (err) {
                                    if (err) reject('error');
                                });                                
                                var csv = json2csv({ data: tables[key], fields: keys, hasCSVColumnTitle: false, eol: '\n' });
                                promiseArray.push(new Promise((_resolve,_reject) => {
                                    fsPath.writeFile(__dirname + '/out/job_history/' + key + '/' + unique_key + '.csv', csv, function (err) {
                                        if (err) _reject('error');
                                        _resolve('done');
                                    });
                                }));
                            } else {
                                // reject('error joining ' + unique_key)
                                console.log('error joining ' + unique_key)
                                logError('error joining ' + unique_key);
                            }
                        }
                        var finalPromise=promiseArray.reduce((prev,now)=>{
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
                        finalPromise.then(()=>{
                            resolve('done');
                        },()=>{
                            resolve('done');
                        })
                    });                    
                } else {
                    logError('No job history files in ' + unique_key);
                    reject('error no files in ' + unique_key);                    
                }
            });
        });

    }
}
module.exports = appObj;