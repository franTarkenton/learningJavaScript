// experimenting with creating modular code.

var map;

function initMap() {
    console.log("map is getting initialized...");
    var options = {
        projection : new OpenLayers.Projection("EPSG:900913"),
        units : 'm',
        maxResolution : 156543.0339,
        maxExtent : new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
        controls : []
    };
    map = new OpenLayers.Map('map', options);
    osmLayer = new OpenLayers.Layer.OSM();

    osmLayer.projection = new OpenLayers.Projection("EPSG:3857");
    map.addLayers([osmLayer]);

    map.setCenter(new OpenLayers.LonLat(-120.75, 49.53).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 12);
    console.log("done initialation");
}
