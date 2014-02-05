var ESRIStatsApp = angular.module('ESRIStatsApp', ['ngRoute', 'ui.bootstrap']);


var routeFunction = function($routeProvider)  {
    $routeProvider.
      when('/', {
        templateUrl: 'app/partials/reportConfig.html',
        controller: 'reportConfigController'
      }).
      when('/config', {
        templateUrl: 'app/partials/backendConfig.html',
        controller: 'backEndConfigCtrl'
      }).
      otherwise({
        redirectTo: '/'
      })};
      
      
ESRIStatsApp.config(['$routeProvider',routeFunction]);

    
                        


