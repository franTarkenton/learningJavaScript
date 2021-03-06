/**
 * @author kjnether
 */

var map;
var aliasproj = new OpenLayers.Projection("EPSG:3857");
var osmLayer;
var bcwms;
var wfsLayer;
var vectors;
var long = -124.0089;

function latLongs() {
    this.vanderHoof = 'test';
    //{ lat: 54.0143, long: -124.0089 };
    this.tazmania = 'test';
    //{ lat: 0, long: 0};
}

var latLongObj = new latLongs();
// pass
var lat = 54.0143;
var zoom = 5;
var gceipAddress = '108.59.81.196';

OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";

function createMap() {
    var options = {
        projection : new OpenLayers.Projection("EPSG:900913"),
        units : 'm',
        maxResolution : 156543.0339,
        maxExtent : new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
        controls : []
    };
    map = new OpenLayers.Map('map', options);
}

function addRasterLayers() {
    osmLayer = new OpenLayers.Layer.OSM();

    osmLayer.projection = new OpenLayers.Projection("EPSG:3857");
    var layerList = ["Base_Mapping_7.5M", 'Annotation', 'Transportation_6M', 'Base_Mapping_2M', 'Transportation_2M', 'Base_Mapping_250K', 'Base_Mapping_20K', 'Transportation_20K', 'Transportation_250K']
    bcwms = new OpenLayers.Layer.WMS("BCGov - Base Mapping", "http://openmaps.gov.bc.ca/mapserver/base3", {
        layers : layerList,
        isBaseLayer : false
    });
    bcwms.projection = aliasproj;

    studyAreaWMS = new OpenLayers.Layer.WMS('WMS Study Area', "http://" + gceipAddress + '/geoserver/wms', {
        'layers' : 'cum_effects:study_bndry',
        transparent : true
    }, {
        isBaseLayer : false,
        opacity : .4
    });
    studyAreaWMS.projection = aliasproj;
}

function addVectorLayers() {
    vectors = new OpenLayers.Layer.Vector("Editable");
    vectors.events.register('featureadded', ' ', doneFunc);
    var wfsStyleMap = new OpenLayers.StyleMap({
        "default" : new OpenLayers.Style({
            fillColor : "#0A8FFF",
            strokeColor : "#030652",
            fillOpacity : .2
        })
    });

    // Trying to add mule deer
    protocol = new OpenLayers.Protocol.WFS({
        url : "http://" + gceipAddress + "/geoserver/wfs",
        version : "1.1.0",
        featureType : "study_bndry",
    });
    studyAreaWFS = new OpenLayers.Layer.Vector("WFS", {
        styleMap : wfsStyleMap,
        strategies : [new OpenLayers.Strategy.BBOX()],
        protocol : protocol,
        projection : new OpenLayers.Projection("EPSG:4326") //telling the wfs how I want the coords served, ie what proj to get returned as
    });

    // var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    // renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    // wfsLayer2 = new OpenLayers.Layer.Vector("States", {
    // minScale : 15000000,
    // strategies : [new OpenLayers.Strategy.BBOX()],
    // projection : new OpenLayers.Projection("EPSG:4326"),
    // protocol : new OpenLayers.Protocol.WFS({
    // url : "http://demo.opengeo.org/geoserver/wfs",
    // featureType : "states",
    // }),
    //
    // });

    // The params below work, and draw up the tasmania roads.
    // protocol = new OpenLayers.Protocol.WFS({
    // url : "http://demo.opengeo.org/geoserver/wfs",
    // featureType : "tasmania_roads",
    // featureNS : "http://www.openplans.org/topp"
    // });
    // wfsLayer = new OpenLayers.Layer.Vector("WFS", {
    // styleMap : wfsStyleMap,
    // strategies : [new OpenLayers.Strategy.BBOX()],
    // protocol : protocol
    // });
    // wfsLayer.projection = new OpenLayers.Projection("EPSG:4326");
}

// Get the extent of the map
function getExtent() {
    var bounds = map.getExtent();
    var bbx = bounds.toBBOX();
    console.log(bbx);
    return bbx;
}

function doneFunc(feat) {
    var geomObj = feat.feature.geometry
    var bounds = geomObj.getBounds();
    console.log("bounds are: " + bounds.toBBOX());
    console.log("new feature was created: " + feat.geometry + ' ' + feat.attributes + ' ' + feat.feature.geometry);
}

function addMapControls() {
    map.addControl(new OpenLayers.Control.OverviewMap({
        autoPan : true,
        layer : [osmLayer]
    }));

    var editToolBarParams = {
        layer : vectors
    };

    map.addControl(new OpenLayers.Control.PanZoomBar());
    map.addControl(new OpenLayers.Control.LayerSwitcher({
        'ascending' : true
    }));
    map.addControl(new OpenLayers.Control.Permalink());
    map.addControl(new OpenLayers.Control.ScaleLine());
    map.addControl(new OpenLayers.Control.Permalink('permalink'));
    var mousePositionControl = new OpenLayers.Control.MousePosition();
    mousePositionControl.displayProjection = new OpenLayers.Projection('EPSG:4326');
    map.addControl(mousePositionControl);
    map.addControl(new OpenLayers.Control.KeyboardDefaults());
    map.addControl(new OpenLayers.Control.Navigation({
        dragPan : new OpenLayers.Control.DragPan(),
        zoomWheelEnabled : true,
        autoActivate : true
    }));
    editingToolBar = new OpenLayers.Control.EditingToolbar(vectors);

    // Adding Editing tools here
    map.addControl(editingToolBar);

    // Add Selection Control, and deactivate it
    selection = new OpenLayers.Control.SelectFeature(vectors, {
        clickout : false,
        toggle : true,
        multiple : false,
        hover : false,
        toggleKey : "ctrlKey", // ctrl key removes from selection
        multipleKey : "shiftKey", // shift key adds to selection
        box : true
    });
    selection.deactivate();
    map.addControl(selection);
}

function makeSelection() {
    var i;
    // iterate over all the controls searching for the SelectFeature Control
    console.log("got here!");
    for (i = 0; i < map.controls.length; i++) {
        control = map.controls[i];
        if ( control instanceof OpenLayers.Control.SelectFeature) {
            console.log("SelectFeature Control has been found");
            if (remember.checked == 1) {
                console.log("checked");
                control.activate();
            } else {
                console.log("not checked");
                control.deactivate();
            }
        }
    }
}

function submitSelectedPoly() {
    // vectors2 = new OpenLayers.Layer.Vector("Editabl2e");
    var numFeats = vectors.features.length;
    var wktParser = new OpenLayers.Format.WKT();
    if (!numFeats) {
        console.log("there are " + numFeats + " in the vector layer");
        console.log("submitting polygon");
        var poly1 = "POLYGON((16423394.426103 -5067349.4300222,16450300.260055 -5132779.5262252,16425228.914781 -5184756.7054519,16372640.239328 -5190260.1714876,16350014.878959 -5179253.2394161,16340230.93934 -5157850.8714992,16345122.90915 -5123607.0828322,16375697.720459 -5123607.0828322,16394042.607245 -5109542.6696297,16365302.284614 -5088751.7979391,16385481.660079 -5064903.4451174,16405661.035543 -5083859.8281295,16405049.539317 -5083859.8281295,16418502.456293 -5100370.2262368,16423394.426103 -5067349.4300222))";
        var poly2 = "POLYGON((16338396.450661 -5106485.1884987,16384870.163852 -5151124.4130111,16350626.375185 -5217166.0054403,16291922.737471 -5203101.5922378,16289476.752566 -5134614.0149038,16289476.752566 -5134614.0149038,16292534.233697 -5116269.1281179,16338396.450661 -5106485.1884987))";
        // want to draw these, calculate the intersection, draw the intersection, report out on the area.
        var feat1 = wktParser.read(poly1);
        var feat2 = wktParser.read(poly2);

        var styleObj = new OpenLayers.StyleMap({
            "default" : new OpenLayers.Style({
                fillColor : "#06FF07",
                strokeColor : "#014002",
                strokeWidth : .5,
                fillOpacity : .2
            })
        });

        vectors.styleMap = styleObj;

        // now calculate the intersection.
        var allfeatures = [feat1, feat2];
        vectors.addFeatures(allfeatures);
    }
    // now compare these features
    var reader = new jsts.io.WKTReader();
    var poly1 = vectors.features[0].geometry.toString();
    var poly2 = vectors.features[1].geometry.toString();
    console.log("poly1: " + poly1);
    console.log("poly2: " + poly2);

    console.log("got the two features");
    var jstsP1 = reader.read(poly1);
    var jstsP2 = reader.read(poly2);
    console.log("about to do the union")
    var union = jstsP1.union(jstsP2);
    var intersection = jstsP1.intersection(jstsP2);

    var parser = new jsts.io.OpenLayersParser();

    intersection = parser.write(intersection);
    var feature4 = new OpenLayers.Feature.Vector(intersection, null, {
        strokeColor : 'yellow',
        fillOpacity : 0
    });
    vectors.addFeatures([feature4]);
}

function finishedDrawingPolygon(feat) {
    var reader = new jsts.io.WKTReader();
    drawnGeom = feat.feature.geometry.toString;
    jstsGeom = reader.read(drawnGeom);
    console.log("feat", feat);
    // now should get the draw control and deactivate it.
    controls = map.getControlsByClass("OpenLayers.Control.DrawFeature");
    console.log("control query returned this many elements:" + controls.length);
    for (var i = 0; i < controls.length; i++) {
        console.log('layer is' + controls[i].layer.name + ' ' + controls[i].layer.id);
        if (controls[i].layer.name === 'Polygon Layer') {
            controls[i].deactivate();
            var geomObj = feat.feature.geometry;
            // now have the features, can now request WFS features that
            // intersect with this feature
            console.log("geomObj:" + geomObj);
            for (var j = 0; j < wfsLayer.features.length; j++) {
                geomObj = wfsLayer.features[j].geometry;
                if ( geomObj instanceof OpenLayers.Geometry.MultiLineString) {
                    console.log("features are multipart: ");
                    components = geomObj.components;
                    for (var k = 0; k < components.length; k++) {
                        curComp = components[k];
                        console.log("    feature: " + curComp);

                        var intersection = jstsP1.intersection(jstsP2);
                    }

                } else {
                    console.log("not multipart");
                }
                //console.log("wfs feature geom: ", wfsLayer.features[j].geometry);
            }
        }
    }
}

function selectfromWFS() {
    var polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer");
    map.addLayer(polygonLayer);
    drawControl = new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon);
    map.addControl(drawControl);
    drawControl.activate();
    polygonLayer.events.register('featureadded', ' ', finishedDrawingPolygon);

    // a) going to draw a polygon on the screen,
    // b) capture the coordinates and report on
    //    distance of road segements within the
    //    polygon.

}

function initMap() {
    console.log("here is am");
    createMap();
    addRasterLayers();
    addVectorLayers();
    addMapControls();

    map.addLayers([osmLayer, studyAreaWMS]);
    //bcwms, vectors,

    //map.setCenter(new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 5);
    //map.setCenter(new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 8);
    //map.setCenter(new OpenLayers.LonLat(146.7, -41.8).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 8);
    map.setCenter(new OpenLayers.LonLat(-120.75, 49.53).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 12);
    //map.set
}

