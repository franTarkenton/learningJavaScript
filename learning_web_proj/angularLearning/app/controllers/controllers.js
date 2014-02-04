

var esriStatsControllers = angular.module('esriStatsControllers', []);

var controllerFunction = function($scope, $routeParams) {
    $scope.a = 5;
    $scope.b = 6;
};

esriStatsControllers.controller('testController', ['$scope', '$routeParams', controllerFunction]);

