// experimenting with creating modular code.
// self-invoking, anonymous function:
"use strict"

var maplib = ( function() {
        OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
        var mapObj = {};

        // local variables
        var map;
        var drawingLayerName = 'tempdrawings';
        var drawingLayer;
        var gce_ip = '108.59.81.196';
        var gce_wfs = "http://" + gce_ip + "/geoserver/wfs"
        var muleDeerWFS;
        var muleDeerProtocolWFS;

        var wfsStyleMap = new OpenLayers.StyleMap({
            "default" : new OpenLayers.Style({
                fillColor : "#0A8FFF",
                strokeColor : "#030652",
                fillOpacity : .2
            })
        });

        function layerExists(lyrName) {
            var retVal = false;
            for (var i = 0; i < map.layers.length; i++) {
                console.log("curlyr name is: " + map.layers[i].name);
                var curLyr = map.layers[i];
                if (curLyr.name === lyrName) {
                    retVal = True;
                }
            }
            return retVal;
        }

        function addDrawingLayer() {
            console.log("adding the drawing layer");
            // adds a vector layer that is used for capturing
            // drawing made to the map.
            drawingLayer = new OpenLayers.Layer.Vector(drawingLayerName);
            drawingLayer.events.register('featureadded', ' ', doneFunc);
            var drawingLayerStyleMap = new OpenLayers.StyleMap({
                "default" : new OpenLayers.Style({
                    fillColor : "#0A8FFF",
                    strokeColor : "#030652",
                    fillOpacity : .2
                })
            });
            map.addLayer(drawingLayer);
        };

        function doneFunc(feat) {
            // may or may not need this, it is currently registered to the feature added event.
            // var geomObj = feat.feature.geometry;
            // var bounds = geomObj.getBounds();
            // console.log("bounds are: " + bounds.toBBOX());
            // console.log("new feature was created: " + feat.geometry + ' ' + feat.attributes + ' ' + feat.feature.geometry);
            console.log("doneFunc called");
        };

        function deactivateDrawingControl() {
            // iterates through the controls and returns the control for the
            // drawing layer.
            var controls = map.getControlsByClass("OpenLayers.Control.DrawFeature");
            for (var i = 0; i < controls.length; i++) {
                console.log('layer is: ' + controls[i].layer.name + ' ' + controls[i].layer.id);
                if (controls[i].layer.name === drawingLayerName) {
                    console.log("got here, found the control on the layer");
                    controls[i].deactivate();
                }
            }
        }

        function finishedDrawingPolygon(feat) {
            // polygon has been completed, Now what do we want to do with it.
            console.log("finished drawing the polygon");
            deactivateDrawingControl();
            // The object that is returned not sure what kind it is,
            // but obj.feature contains the feature that was just added.
            // or in this case feat.feature.

            // next step is to query some of the wfs analysis layers.  Questions
            // would be nice to return the features, that are inside the polygon
            // if there are too many than alert the user that the polygon is too
            // large, remove it and redraw
            // later on fix this limitation.

        };

        function addCumEffects_WFS(addToMap) {
            muleDeerProtocolWFS = new OpenLayers.Protocol.WFS({
                url : gce_wfs,
                version : "1.1.0",
                featureType : "mule_deer",
      
            });
            muleDeerWFS = new OpenLayers.Layer.Vector("WFS", {
                styleMap : wfsStyleMap,
                strategies : [new OpenLayers.Strategy.BBOX()],
                protocol : muleDeerProtocolWFS,
                projection : new OpenLayers.Projection("EPSG:900913") //This is how the coordinates will be served
            });
            if (addToMap === true) {
                map.addLayer(muleDeerWFS);
            }
        }

        /**
         * Going to add the cumulative effects WFS layers, but
         * they will be added as wms's with query capability for
         * now.
         */
        function addCumEffectsLayers_WMS() {

            var cumEffectsStudyArea = new OpenLayers.Layer.WMS("cum_effects:study_bndry - Tiled", "http://108.59.81.196:8080/geoserver/cum_effects/wms", {
                LAYERS : 'cum_effects:study_bndry',
                STYLES : '',
                format : 'image/png',
                tiled : true,
                tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom,
                transparent : true
            }, {
                opacity : 0.35,
                buffer : 0,
                displayOutsideMaxExtent : true,
                isBaseLayer : false,
                yx : {
                    'EPSG:3005' : false
                }
            });
            map.addLayer(cumEffectsStudyArea);

            var cumEffectsMuleDeer = new OpenLayers.Layer.WMS("cum_effects:mule_deer - Tiled", "http://108.59.81.196:8080/geoserver/cum_effects/wms", {
                LAYERS : 'cum_effects:mule_deer',
                STYLES : '',
                format : 'image/png',
                tiled : true,
                tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom,
                transparent : true
            }, {
                opacity : 0.35,
                buffer : 0,
                displayOutsideMaxExtent : true,
                isBaseLayer : false,
                yx : {
                    'EPSG:3005' : false
                }
            });
            map.addLayer(cumEffectsMuleDeer);
        }

        /**
         * 1) iterates through the features provided as an arg
         * 2) Uses JSTS to calculate portions that are inside
         *    submitted polygon,
         * 3) adds the intersected features to a new layer
         * 4) draws the new layer
         */
        function calcIntersection(features) {
            // TODO: need to come back and add logic to make sure that we actually have a drawing feature to work with
            console.log("processing this number of features: " + features.length);
            var jstsReader = new jsts.io.WKTReader();

            var intersectFeature = drawingLayer.features[0];
            var intersectGeomString = intersectFeature.geometry.toString();
            var intersectJSTSGeom = jstsReader.read(intersectGeomString);
            for (var i = 0; i < features.length; i += 1) {
                // first test to see of the geometry intersects, if it
                // does then we will calculate the portions that are
                // insdie the drawing polygon.

                // if there is an intersection should then test for contains.
                // if the poly is contained then we do not have to determine
                // the portions that intersect.
                console.log("feature count: "  + features[i].geometry);
                var jstsGeom = jstsReader.read(features[i].geometry.toString());
                // is it contained?
                if (intersectJSTSGeom.contains(intersectJSTSGeom)) {
                    // just add it to the new layer
                    console.log("feature is contained!");
                } else if (intersectJSTSGeom.intersects(intersectJSTSGeom)) {
                    console.log("intersects!");
                } else {
                    console.log("Toss it!");
                }
            }
            console.log("finished!")
        }

        function test_adddummyPolygon() {
            if ( typeof (drawingLayer) === "undefined") {
                addDrawingLayer();
            }
            var wktParser = new OpenLayers.Format.WKT();
            var wktpoly = "POLYGON((-13454551.096475 6371596.6845817,-13448206.823128 6372208.1808079,-13439531.220419 6369838.6329314,-13434983.217236 6363723.6706694,-13450347.05992 6359443.197086,-13454551.096475 6371596.6845817))";
            var feat1 = wktParser.read(wktpoly);
            drawingLayer.addFeatures([feat1]);
        }

        /**
         * Remove all the polygons in the drawing layer
         */
        mapObj.clearAOI = function clearAOI() {
            drawingLayer.removeAllFeatures();
        };

        mapObj.reportOnDrawing = function reportOnDrawing() {
            // get the information underneath the drawn polygon with a
            // wfs query in a web worker
            // A) define a filter
            addCumEffects_WFS();
            test_adddummyPolygon();
            var drawingGeom = drawingLayer.features[0].geometry;
            console.log("drawinglayer geom is:" + drawingGeom);

            var spatialFilterParams = {
                type : OpenLayers.Filter.Spatial.INTERSECTS,
                value : drawingGeom, 
                projection: new OpenLayers.Projection("EPSG:900913")

            };
            var filter_spatial = new OpenLayers.Filter.Spatial(spatialFilterParams);
            
            
            var compObj = {
                type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO, 
                property: 'RISK', 
                value: 'NOT APPLICABLE'
            };
            var filter_conditional = new OpenLayers.Filter.Comparison(compObj);
            var allfilters = [filter_spatial, filter_conditional]
            var filterComb = new OpenLayers.Filter.Logical(
                {
                    filters:allfilters,
                    type: OpenLayers.Filter.Logical.AND, 
                });
            
            console.log("filter enabled!");

            // going to read the features from the vector layer that
            // wraps the wfs protocol.  Down the road look into whether it is
            // significantly more efficient to read straight from the protocol object.

            muleDeerProtocolWFS.read({
                filter: filterComb,
                callback: WFSReadCallBack
            });
        }
        
        function objectToConsole(inObj) {
            var keys = Object.keys(inObj);
            for (var i=0; i<keys.length; i++) {
                console.log(keys[i] + ' = ' + inObj[keys[i]]);
            }
        }
        
        function WFSReadCallBack(response) {
            // TODO: should come back and add a visual widget to show that processing is taking place behind the scenes.
            // read from the response and send the features to the 
            // intersect method.
            if (response.error) {
                //TODO: should figure out what to do if an error is encountered here. Exceptions?
                objectToConsole(response)
                console.log("error with the WFS query");
                console.log(response.error);
                console.log(response.error.exceptionReport.exceptions[0]);
                console.log(response.error.exceptionReport.exceptions[0].texts[0]);
            }
            console.log("Callback called!");
            
            console.log("elements in response: " + response.features.length);
            // now send the features to the intersection method
            calcIntersection(response.features);
        }

        mapObj.drawAOI = function drawAOI(drawMethod) {
            if ( typeof (drawingLayer) === "undefined") {
                addDrawingLayer();
            }
            // now drawing control
            var drawControl = new OpenLayers.Control.DrawFeature(drawingLayer, OpenLayers.Handler.Polygon);
            map.addControl(drawControl);
            drawControl.activate();
            drawingLayer.events.register('featureadded', ' ', finishedDrawingPolygon);
        };

        mapObj.addBaseLayer = function addBaseLayer(layer2Add) {
            var lyrs2add = [];
            if (layer2Add === "undefined") {
                layer2Add = 'osm';
            }
            if (layer2Add === 'osm') {
                console.log("adding osm base layer");
                var osmLayer = new OpenLayers.Layer.OSM();

                osmLayer.projection = new OpenLayers.Projection("EPSG:3857");
                lyrs2add.push(osmLayer)
                //map.addLayers([osmLayer]);
            }

            var gmapStreet = new OpenLayers.Layer.Google("Google Streets", {
                numZoomLevels : 20
            });

            var gmapHybrid = new OpenLayers.Layer.Google("Google Hybrid", {
                //visibility : false,
                type : google.maps.MapTypeId.HYBRID,
                numZoomLevels : 23,
                MAX_ZOOM_LEVEL : 22
            });

            console.log("here");
            // map.addLayers([gmap]);

            var gmapsat = new OpenLayers.Layer.Google('Google Satellite', {
                type : google.maps.MapTypeId.SATELLITE,
                numZoomLevels : 23,
                MAX_ZOOM_LEVEL : 22
            });
            lyrs2add.push(gmapStreet);
            lyrs2add.push(gmapHybrid);
            lyrs2add.push(gmapsat);
            lyrs2add.push(osmLayer)
            map.addLayers(lyrs2add);
            map.setBaseLayer(gmapHybrid);
            map.baseLayer = gmapHybrid;
            addCumEffectsLayers_WMS();
        };

        mapObj.addMapControls = function addMapControls() {
            var t = '';
            //map.addControl(new OpenLayers.Control.OverviewMap({
            //	autoPan : true,
            //	layer : [osmLayer]
            //}));

            // var editToolBarParams = {
            // layer : vectors
            // };

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
            //editingToolBar = new OpenLayers.Control.EditingToolbar(vectors);

            // Adding Editing tools here
            //map.addControl(editingToolBar);

            // Add Selection Control, and deactivate it
            // selection = new OpenLayers.Control.SelectFeature(vectors, {
            // clickout : false,
            // toggle : true,
            // multiple : false,
            // hover : false,
            // toggleKey : "ctrlKey", // ctrl key removes from selection
            // multipleKey : "shiftKey", // shift key adds to selection
            // box : true
            // });
            // selection.deactivate();
            // map.addControl(selection);
        };

        mapObj.initMap = function() {
            console.log("map is getting initialized...");
            var options = {
                projection : new OpenLayers.Projection("EPSG:900913"),
                units : 'm',
                maxResolution : 156543.0339,
                maxExtent : new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
                controls : []
            };
            map = new OpenLayers.Map('map', options);
            mapObj.addBaseLayer('osm');

            map.setCenter(new OpenLayers.LonLat(-120.75, 49.53).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 12);
            console.log("done initialation");
        };
        return mapObj;

    }());

