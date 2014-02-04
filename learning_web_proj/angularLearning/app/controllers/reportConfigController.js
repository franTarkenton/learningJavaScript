
var cntrlFunction = function ($scope, $routeParams) {
    $scope.a = 5;
    $scope.b = 6; //reportConfigController 
};

ESRIStatsApp.controller('reportConfigController', ['$scope', '$routeParams', cntrlFunction]);
