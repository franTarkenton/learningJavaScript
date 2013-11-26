// experimenting with creating modular code.
// self-invoking, anonymous function:
var maplib;
 maplib = function() {

    var mapObj = {};
    
    // example of local or private function:
    function someFunc() {
        var  somevar = 1; // local variable
        console.log("somevar is now 1");
    }
    
    mapObj.printSomething = function printSomething() {
        console.log( 'hello got here hello' );
        someFunc();
    }

    mapObj.initMap = function() {
        console.log("map is getting initialized...");
        var options = {
            projection : new OpenLayers.Projection("EPSG:900913"),
            units : 'm',
            maxResolution : 156543.0339,
            maxExtent : new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            controls : []
        };
        mapObj.map = new OpenLayers.Map('map', options);
        osmLayer = new OpenLayers.Layer.OSM();

        osmLayer.projection = new OpenLayers.Projection("EPSG:3857");
        mapObj.map.addLayers([osmLayer]);

        mapObj.map.setCenter(new OpenLayers.LonLat(-120.75, 49.53).transform(new OpenLayers.Projection("EPSG:4326"), mapObj.map.getProjectionObject()), 12);
        console.log("done initialation");
    };
    return mapObj;

};


