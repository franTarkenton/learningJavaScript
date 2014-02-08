var ESRIStatsApp = angular.module('ESRIStatsApp', ['ngRoute', 'ui.bootstrap']);


var routeFunction = function($routeProvider)  {
    $routeProvider.
      when('/report', {
        templateUrl: 'app/partials/reportConfig.html',
        controller: 'reportConfigController'
      }).
      when('/config', {
        templateUrl: 'app/partials/backendConfig.html',
        controller: 'backEndConfigCtrl'
      }).
      otherwise({
        redirectTo: '/report'
      })};
      
      
// appconfigParamList = ['$httpProvider', function($httpProvider) {
        // $httpProvider.defaults.useXDomain = true;
        // delete $httpProvider.defaults.headers.common['X-Requested-With'];
    // }
// ];
//       
      
ESRIStatsApp.config(['$routeProvider',routeFunction]);
// ESRIStatsApp.config(appconfigParamList);
    
                        


