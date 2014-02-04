var appObj = angular.module("ESRIStatsApp", []);

var factoryFunction = function() {
    var factory = {};
    //new Date(year, month, day, hours, minutes, seconds, milliseconds);
    // eventually want to replace this with a query to a service, but this 
    // will do for now as a very small sample of data.
    var usageStats = [{sample_time: new Date(2013, 1, 1), 
                       arcinfo: 133, 
                       editor: 21, 
                       viewer: 129}, 
                       {sample_time: new Date(2013, 2, 1),
                        arcinfo: 179, 
                        editor: 29, 
                        viewer: 138}, 
                       {sample_time: new Date(2013, 3, 1),
                        arcinfo: 115, 
                        editor: 19, 
                        viewer: 156}, 
                       {sample_time: new Date(2013, 4, 1),
                        arcinfo: 139, 
                        editor: 2, 
                        viewer: 162}, 
                       {sample_time: new Date(2013, 5, 1),
                        arcinfo: 124, 
                        editor: 3, 
                        viewer: 156}]};
                        
    factory.getData = function() {
        return usageStats;
    };
    
appObj.factory('getData', factoryFunction).controller('esriStatsControllers')
