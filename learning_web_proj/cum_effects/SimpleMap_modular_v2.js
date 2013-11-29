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

        var wfsStyleMap = new OpenLayers.StyleMap({
            "default" : new OpenLayers.Style({
                fillColor : "#0A8FFF",
                strokeColor : "#030652",
                fillOpacity : .2
            })
        });

        // example of local or private function:
        function someFunc() {
            var somevar = 1;
            // local variable
            console.log("somevar is now 1");
        };

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

        /**
         * Going to add the cumulative effects WFS layers, but
         * they will be added as wms's with query capability for
         * now.
         */
        function addCumEffectsLayers_WMS() {
            var protocol = new OpenLayers.Protocol.WFS({
                url : gce_wfs,
                version : "1.1.0",
                featureType : "study_bndry",
            });
            var studyAreaWFS = new OpenLayers.Layer.Vector("WFS", {
                styleMap : wfsStyleMap,
                strategies : [new OpenLayers.Strategy.BBOX()],
                protocol : protocol,
                projection : new OpenLayers.Projection("EPSG:4326") //telling the wfs how I want the coords served, ie what proj to get returned as
            });
            map.addLayer(studyAreaWFS);
        }


        mapObj.printSomething = function printSomething() {
            console.log('hello got here hello');
        };

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

