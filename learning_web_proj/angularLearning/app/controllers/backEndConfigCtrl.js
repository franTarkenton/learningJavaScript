/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

var cntrlFunction = function ($scope, $location, $http, usageStats, productConfig, userConfig) {
    "use strict";
    var i, productInfo, users, getListObject;
    
    $scope.productInfo = {};
    $scope.productInfo.data = productConfig.query();
    $scope.productInfo.add = function() {
        console.log("value to enter is: " + $scope.productInfo.value2Add);
        if ($scope.productInfo.value2Add !== null) {
            $scope.productInfo.value2Add = $scope.productInfo.value2Add.trim();
            if ($scope.productInfo.value2Add !== null && $scope.productInfo.value2Add !== '') {
                console.log("valeu to enter is: " + $scope.productInfo.value2Add);
                $scope.productInfo.data.push($scope.productInfo.value2Add);
                //$product = listObj.value2Add;
                productConfig.save({data:$scope.productInfo.value2Add}, function() {
                    $scope.productInfo.data = productConfig.query();
                });
                console.log("productInfo.data" + $scope.productInfo.data);
            }
        }
        $scope.productInfo.value2Add = null;
    };
    
    $scope.productInfo.del = function() {
        console.log("you want me to delete: " + $scope.productInfo.selected);
        // make sure it isn't null
        if ($scope.productInfo.selected !== null &&
             $scope.productInfo.selected !== undefined) {
                 console.log("going to delete");
            productConfig.remove({data:$scope.productInfo.selected}, function() {
                $scope.productInfo.data = productConfig.query();
            });
        }
        
    };
    
    $scope.productInfo.reset = function() {
        productConfig.reset({data:undefined}, function () {
            $scope.productInfo.data = productConfig.query();
        });
    };
    
    $scope.users = {}
    $scope.users.data = userConfig.query();
    $scope.users.add = function() {
        console.log("value to enter is: " + $scope.users.value2Add);
        if ($scope.users.value2Add !== null) {
            $scope.users.value2Add = $scope.users.value2Add.trim();
            if ($scope.users.value2Add !== null && $scope.users.value2Add !== '') {
                console.log("valeu to enter is: " + $scope.users.value2Add);
                $scope.users.data.push($scope.users.value2Add);
                //$product = listObj.value2Add;
                userConfig.save({data:$scope.users.value2Add}, function() {
                    $scope.users.data = userConfig.query();
                });
                console.log("user.data" + $scope.users.data);
            }
        }
        $scope.users.value2Add = null;
    };
    
    $scope.users.del = function() {
        console.log("you want me to delete: " + $scope.users.selected);
        // make sure it isn't null
        if ($scope.users.selected !== null &&
             $scope.users.selected !== undefined) {
                 console.log("going to delete");
            userConfig.remove({data:$scope.users.selected}, function() {
                $scope.users.data = userConfig.query();
            });
        }
    };

    $scope.users.reset = function() {
        userConfig.reset({data:undefined}, function () {
            $scope.users.data = userConfig.query();
        });
    };
    
                        
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

ESRIStatsApp.controller('backEndConfigCtrl', [ '$scope', '$location', '$http', 'usageStats', 'productConfig', 'userConfig', cntrlFunction]);
