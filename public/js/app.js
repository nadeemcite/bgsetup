const app = angular.module('myapp', ['ngRoute','ngSanitize','ngCsv']);
app.config(function ($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: 'views/folders.html',
        controller: 'FoldersController'
    }).when("/folder/:folder_name", {
        templateUrl: 'views/folder.html',
        controller: 'FolderController'
    })
})
app.controller('FoldersController', function ($scope, $http) {
    $scope.init = function () {
        $http({
            url: 'explorer',
            params: {
                path: "/"
            }
        }).then(function (response) {
            $scope.folders = response.data.files;
        })
    }
    $scope.init();
});

app.controller('FolderController', function ($scope, $http, $routeParams) {
    $scope.selectFile = function (filename, isdir) {
        $http({
            url: 'read-file',
            method: 'post',
            data: {
                file: filename,
                dir: $routeParams.folder_name
            }
        }).then(function (response) {
            if (response.data.type == 'file') {
                $scope.settle(JSON.parse(response.data.data), filename)
            } else {
                var arr = response.data.data.map(d => {
                    var obj = JSON.parse(d.text);
                    obj.fileName = d.fileName
                    return obj;
                });
                $scope.settle(arr, 'job_history');
            }
        })
    }
    $scope.settle = function (data, fileName) {
        $scope.rows = {};
        $scope.table = [];
        $scope.tables = null;
        switch (fileName) {
            case 'HistoryMaster':
                $scope.rows = Object.keys(data.PS[0]);
                $scope.table = data.PS;
                break;
            case 'HistoryHDR.json':
                $scope.rows = Object.keys(data.HHDR[0]);
                $scope.table = data.HHDR;
                break;
            case 'NewCustomerVehicleDetails':
                $scope.rows = Object.keys(data);
                $scope.table = [data];
                break;
        }
        if(fileName=="job_history"){
            
            $scope.tables={
                'FOLLOWUP':[],
                'P':[],
                'L':[],
                'D':[]
            }
            data.forEach(function(row){
                var fArray=row.FOLLOWUP.map(function(r){
                    r.fileName=row.fileName;
                    return r;
                });
                $scope.tables.FOLLOWUP=$scope.tables.FOLLOWUP.concat(fArray);
                var pArray=row.P.map(function(r){
                    r.fileName=row.fileName;
                    return r;
                });
                $scope.tables.P=$scope.tables.P.concat(pArray);
                var lArray=row.L.map(function(r){
                    r.fileName=row.fileName;
                    return r;
                });
                $scope.tables.L=$scope.tables.L.concat(lArray);
                var dArray=row.D.map(function(r){
                    r.fileName=row.fileName;
                    return r;
                });
                $scope.tables.D=$scope.tables.D.concat(dArray);
            });
        }
        $scope.unique_key = $routeParams.folder_name;
    }
});