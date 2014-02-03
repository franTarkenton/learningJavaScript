var ESRIStatsApp = angular.module('ESRIStatsApp', ['ngRoute', 'esriStatsControllers']);


var routeFunction = function($routeProvider)  {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/default.html',
        controller: 'testController'
      }).
      when('/phones/:phoneId', {
        templateUrl: 'partials/view2.html',
        controller: 'testController'
      }).
      otherwise({
        redirectTo: 'partials/default.html'
      })};
      
      
ESRIStatsApp.config(['$routeProvider',routeFunction]);

    
                        


