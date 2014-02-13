
var esriStatsObj = function() {
    var factory = {};
    //new Date(year, month, day, hours, minutes, seconds, milliseconds);
    // eventually want to replace this with a query to a service, but this 
    // will do for now as a very small sample of data.
    var dummyData = [{sample_time: new Date(2013, 1, 1), 
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
                        viewer: 156}];
                        
    factory.getDummyData = function() {
        return dummyData;
    };
    
    factory.getData = function () { 
    
        var requestObj = {
            method: 'GET',
            url:'http://subban.no-ip.biz/esriStats/bozak',
        };    
                
        console.log("makding the request");
        $http(requestObj ).success(function(data, status, headers, config) {
            var i, keys;
            console.log('data is: ' + data + ' type: ' + typeof data );
            if (typeof data === 'object') {
                console.log("object data");
                keys = Object.keys(data);
                for (i=0; i<keys.length; i+=1){
                    console.log("key:" + keys[i] + ' value: ' + data[keys[i]]);
                }
            }
        }).error(function(data, status, headers, config) {
            console.log("error encountered!");
        });
    };
    
    
    
    
    
    return factory;
};
    
ESRIStatsApp.factory('esriStatsFactory', esriStatsObj);
