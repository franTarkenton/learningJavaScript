
var esriStatsServices = angular.module('esriStatsServices', ['ngResource']);

esriStatsServices.factory('usageStats', ['$resource',
    function($resource) {
        var baseUrl =  'http://subban.no-ip.biz/esriStats/bozak';
        return $resource(baseUrl, {} , {
            get: {method: 'GET'}
        })
     }]
);

esriStatsServices.factory('config', ['$resource', 
    function($resource) {
        var baseUrl =  'http://subban.no-ip.biz/esriStats/';
        return $resource(baseUrl + 'config/:configType', {verb: 'config', confType: 'products'}, {
            query: {method: 'GET', params: {}, isArray: true}
        }) 
    }]);


// ESRIStatsApp.factory('esriStatsFactory', ['$http', function($http) {
//     
    // //var baseUrl = '/user/123/card';
//     
    // baseUrl = 'http://subban.no-ip.biz/esriStats/';
//     
    // return {
        // get: function() {
            // console.log("calling the bozak url");
            // return $http.get(baseUrl + '/bozak');
        // },
        // // save: function(card) {
            // // var url = card.id ? baseUrl + '/' + card.id : baseUrl;
            // // return $http.post(url, card);
        // // },
        // query: function() {
            // return $http.get(baseUrl);
        // },
        // charge: function(card) {
        // return $http.post(baseUrl + '/' + card.id, card, {params: {charge: true}});
    // }
    // };
// }]);
