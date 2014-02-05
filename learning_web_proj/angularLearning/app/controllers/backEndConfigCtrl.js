var cntrlFunction = function ($scope, $routeParams, $location) {
    $scope.a = 5;
    $scope.b = 6; //reportConfigController
};

ESRIStatsApp.controller('backEndConfigCtrl', ['$scope', '$routeParams', cntrlFunction]);
