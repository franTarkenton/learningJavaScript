/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

var cntrlFunction = function ($scope, $location, $http, usageStats, config) {
    "use strict";
    var i, productInfo, users, getListObject;
    
    getListObject = function() {
        var listObj = {};
        listObj.data = [];
        listObj.selected = null;
        listObj.value2Add = null;
        
        listObj.setData = function(data) {
            listObj.data = data;
            listObj.selected = data[0];
        };
        
        listObj.setDataFromService = function(serviceData) {
            var i, data, curData;
            curData = [];
            serviceData.$promise.then(function(data) {
                for (i=0; i<data.length; i+=1) {
                    curData.push(data[i].data);
                }
            });
            listObj.data = curData;
            listObj.selected = curData[0];
        };
                
        listObj.deleteSelected = function() {
            testfunc();
            console.log('sel: ' + listObj.selected); 
            for ( i=0; i<listObj.data.length; i+=1) {
                console.log(i + ' ' + listObj.data[i]);
                if (listObj.selected === listObj.data[i]) {
                    console.log("here");
                    listObj.data.splice(i, 1);
                    listObj.selected = listObj.data[0];
                }
            }
        };
        
        function testfunc() {
            var i;
            // test the factory: 
            var data = config.query();
            // var data = usageStats.get();
            
            // retrieving the deferred data
            data.$promise.then(function(data) {

                for (i=0; i<data.length; i++) {
                    console.log('data is' + data[i].data);
                }
            });
        };
        
        listObj.add = function() {
            console.log("value to enter is: " + listObj.value2Add);
            if (listObj.value2Add !== null) {
                listObj.value2Add = listObj.value2Add.trim();
                if (listObj.value2Add !== null && listObj.value2Add !== '') {
                    console.log("valeu to enter is: " + listObj.value2Add);
                    listObj.data.push(listObj.value2Add);
                }
            }
            listObj.value2Add = null;
        };
        return listObj;
    };
    
    productInfo = getListObject();
    var productsArray = config.query();
    //productInfo.setData(['ARC/INFO', 'EDITOR', 'VIEWER']);
    productInfo.setDataFromService(productsArray);
    $scope.productInfo = productInfo;
    
    users = getListObject();
    users.setData(['HPRARC', 'REPLICAT','WINS', 'SYSTEM',
                        'SRMOIAS', 'ESRI']);
    $scope.users = users;
                        
    
    $scope.tmpTablePrefix = 'esritmp_';
    $scope.backPath = '/report';
    
    $scope.proceed = function() {
        console.log("proceeding!!");
        // data in this form should be sent back to the factory and 
        // saved
        $location.path( $scope.backPath );
    };
    
    $scope.cancel = function( ) {
        // data in this form should be ignored, revert back to data in the factory
        console.log("path is: " + $scope.backPath);
        $location.path( $scope.backPath );
    };
                         
};

ESRIStatsApp.controller('backEndConfigCtrl', [ '$scope', '$location', '$http', 'usageStats', 'config', cntrlFunction]);
