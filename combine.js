const fs = require("fs");
const fsPath = require("fs-path");
var concat = require('concat-files');
var outDir = __dirname + '/combine';
function replaceText(someFile){
    console.log(someFile)
    fs.readFile(someFile, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = data.split("\n").filter(d=>{return d.trim()!='';}).join("\n");
        fs.writeFile(someFile, result, 'utf8', function (err) {
           if (err) return console.log(err);
        });
      });
      
}
fs.readdir(__dirname + '/out/HistoryHDR.json', function (err, items) {
    concat(items.map((name)=>{
        return __dirname + '/out/HistoryHDR.json/'+name;
    }),outDir+'/HistoryHDR.json.csv',function(err) {
        if (err) throw err
        console.log('done');
        replaceText(outDir+'/HistoryHDR.json.csv');
      });
});
fs.readdir(__dirname + '/out/HistoryMaster', function (err, items) {
    concat(items.map((name)=>{
        return __dirname + '/out/HistoryMaster/'+name;
    }),outDir+'/HistoryMaster.csv',function(err) {
        if (err) throw err
        console.log('done');
        replaceText(outDir+'/HistoryHDR.json.csv');
      });
});
fs.readdir(__dirname + '/out/NewCustomerVehicleDetails', function (err, items) {
    concat(items.map((name)=>{
        return __dirname + '/out/NewCustomerVehicleDetails/'+name;
    }),outDir+'/NewCustomerVehicleDetails.csv',function(err) {
        if (err) throw err
        console.log('done');
        replaceText(outDir+'/NewCustomerVehicleDetails.csv');
      });
});
fs.readdir(__dirname + '/out/job_history/D', function (err, items) {
    concat(items.map((name)=>{
        return __dirname + '/out/job_history/D/'+name;
    }),outDir+'/job_history_D.csv',function(err) {
        if (err) throw err
            console.log('done');
        replaceText(outDir+'/job_history_D.csv');
      });
});
fs.readdir(__dirname + '/out/job_history/L', function (err, items) {
    concat(items.map((name)=>{
        return __dirname + '/out/job_history/L/'+name;
    }),outDir+'/job_history_L.csv',function(err) {
        if (err) throw err
        console.log('done');
        
        replaceText(outDir+'/job_history_L.csv');
      });
});
fs.readdir(__dirname + '/out/job_history/P', function (err, items) {
    concat(items.map((name)=>{
        return __dirname + '/out/job_history/P/'+name;
    }),outDir+'/job_history_P.csv',function(err) {
        if (err) throw err
        console.log('done');
        
        replaceText(outDir+'/job_history_P.csv');
      });
});
fs.readdir(__dirname + '/out/job_history/FOLLOWUP', function (err, items) {
    concat(items.map((name)=>{
        return __dirname + '/out/job_history/FOLLOWUP/'+name;
    }),outDir+'/job_history_FOLLOWUP.csv',function(err) {
        if (err) throw err
        console.log('done');
        
        replaceText(outDir+'/job_history_FOLLOWUP.csv');
      });
});