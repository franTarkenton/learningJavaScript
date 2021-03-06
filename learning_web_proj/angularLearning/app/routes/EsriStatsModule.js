var ESRIStatsApp = angular.module('ESRIStatsApp', ['ngRoute', 'ui.bootstrap', 'esriStatsServices', 'googlechart']);


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

ESRIStatsApp.config(['$sceDelegateProvider', 
    function($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(
            ['self', 
            'http://subban.no-ip.biz/esriStats/**', 
            'http://subban.no-ip.biz/esriStats/config/**',
            'http://cumeffects.dev/**']);
}])

// ESRIStatsApp.config(appconfigParamList);
    
                        


