// experimenting with creating modular code.
// self-invoking, anonymous function:

/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */

var maplib = ( function() {"use strict";
        OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";

        var mapObj, map, drawingLayerName, drawingLayer, gce_ip, 
            gce_wfs, gce_wms, muleDeerWFS, muleDeerProtocolWFS, 
            infoControl, albersProj, wfsStyleMap, webMercatorProj, 
            analysisData, gce_domain, gce_ows, pieChart;

        mapObj = {};

        

        // local variables
        drawingLayerName = 'tempdrawings';
        gce_ip = '173.255.119.161';
        gce_domain = 'subban.no-ip.biz';
        gce_wfs = "http://" + gce_domain + "/geoserver/wfs";
        gce_wms = "http://" + gce_domain + "/geoserver/wms";
        gce_ows = "http://" + gce_domain + "/geoserver/ows";
        albersProj = 'EPSG:3005';
        webMercatorProj = 'EPSG:900913';        

        wfsStyleMap = new OpenLayers.StyleMap({
            "default" : new OpenLayers.Style({
                fillColor : "#0A8FFF",
                strokeColor : "#030652",
                fillOpacity : 0.2
            })
        });
        
        /**
         * simple debugging function, spits objects to the console.  Careful when 
         * objects contain recursive relationships as can result in a never ending 
         * loop. 
         */
        function objectToConsole(obj, indent) {
            // super handy method, don't want to lose this. Useful for debugging
            // and figuring out stuff.
            var keys, i, key, value, spaces, spacesInIndent, isObj, bracketStart, bracketEnd;
            spacesInIndent = 4;
            bracketStart = '{';
            bracketEnd = '}';
            if (typeof indent === 'undefined') {
                indent = 0;
            }
            isObj = false;
            //console.log(typeof indent);
            spaces = Array(indent).join(' ');
            //console.log("spaces: " + spaces);
            keys = Object.keys(obj);
            for ( i = 0; i < keys.length; i += 1) {
                key = keys[i];
                value = obj[key];
                if (( typeof value).toString() === 'object') {
                    if (Object.prototype.toString.call(value) === '[object Array]') {
                        bracketStart = '[';
                        bracketEnd = ']';
                    }
                    console.log(spaces + key + ' : ' + bracketStart);
                    indent = indent + spacesInIndent;
                    objectToConsole(value, indent);
                    indent = indent - spacesInIndent;
                    spaces = Array(indent).join(' ');
                    console.log(spaces + bracketEnd + ' ');
                } else {
                    console.log(spaces + key + ' : ' + value);
                }
            }
            if (isObj) {
                //indent = indent - spacesInIndent;
            }
        }

        function layerExists(lyrName) {
            var retVal, i, curLyr;
            retVal = false;
            for ( i = 0; i < map.layers.length; i += 1) {
                console.log("curlyr name is: " + map.layers[i].name);
                curLyr = map.layers[i];
                if (curLyr.name === lyrName) {
                    retVal = true;
                }
            }
            return retVal;
        }

        function doneFunc(feat) {
            // may or may not need this, it is currently registered to the feature added event.
            // var geomObj = feat.feature.geometry;
            // var bounds = geomObj.getBounds();
            // console.log("bounds are: " + bounds.toBBOX());
            // console.log("new feature was created: " + feat.geometry + ' ' + feat.attributes + ' ' + feat.feature.geometry);
            console.log("doneFunc called");
        }
        
        function updateBackgroundProcessingStatus(statusMessage, inProgress) {
            var spinnerOpts, spin;
            spinnerOpts = {
                lines: 11, length: 3, width: 3, radius: 4, corners: 0,
                 rotate: 13, trail: 60, speed: 1.0, left: 145, top: -5
            };

            var elem2Search4, elem;
            elem2Search4 = 'backgrounProcessingStatus';
            elem = document.getElementById(elem2Search4);
            elem.innerHTML = statusMessage;
            if (inProgress) {
                // make the text flash!
                spin = new Spinner(spinnerOpts).spin(elem);
            }
            
            console.log("elem is: " + elem);
            //.innerHTML(statusMessage);
        }

        function addDrawingLayer() {
            console.log("adding the drawing layer");
            // adds a vector layer that is used for capturing
            // drawing made to the map.
            drawingLayer = new OpenLayers.Layer.Vector(drawingLayerName);
            drawingLayer.displayInLayerSwitcher = false;
            drawingLayer.events.register('featureadded', ' ', doneFunc);
            var drawingLayerStyleMap = new OpenLayers.StyleMap({
                "default" : new OpenLayers.Style({
                    fillColor : "#8BFF9F",
                    strokeColor : "#06701D",
                    strokeWidth : 2,
                    fillOpacity : 0.2
                })
            });
            drawingLayer.styleMap = drawingLayerStyleMap;
            drawingLayer.projection = new OpenLayers.Projection(webMercatorProj);
            map.addLayer(drawingLayer);
        }

        function deactivateDrawingControl() {
            // iterates through the controls and returns the control for the
            // drawing layer.
            var controls, i;
            controls = map.getControlsByClass("OpenLayers.Control.DrawFeature");
            for ( i = 0; i < controls.length; i += 1) {
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
            updateBackgroundProcessingStatus('Retreiving overlapping features...', true);

            // The object that is returned not sure what kind it is,
            // but obj.feature contains the feature that was just added.
            // or in this case feat.feature.

            // next step is to query some of the wfs analysis layers.  Questions
            // would be nice to return the features, that are inside the polygon
            // if there are too many than alert the user that the polygon is too
            // large, remove it and redraw
            // later on fix this limitation.
            console.log("geom of draw feature: " + feat);
            console.log("geom of drawing feature" + drawingLayer.features[0].geometry);
            mapObj.reportOnDrawing();
        }
        
        function getWFSProtocolConfigs() {
            var i, protocolArray, wfsParams, wmsName, tmp;
            protocolArray = [];
            // extracting the wfs info from the analysisData object
            for ( i = 0; i < analysisData.length; i += 1) {
                if (analysisData[i].hasOwnProperty("wfsProtocolParams")) {
                    wmsName = analysisData[i].wmsName;
                    wfsParams = analysisData[i].wfsProtocolParams;
                    tmp = {name: wmsName, wfsProtocolParams: wfsParams};
                    if (analysisData[i].hasOwnProperty("filter")) {
                        tmp.filter = analysisData[i].filter;
                    }
                    protocolArray.push(tmp);
                }
            }
            return protocolArray;
        }

        function addAnalysisData(addToMap) {
            var i, lyr, protocol;
            lyr = [];
            console.log("Adding WFS layers aka analysis data!");
            for ( i = 0; i < analysisData.length; i += 1) {

                if (analysisData[i].hasOwnProperty("wfsName") && analysisData[i].hasOwnProperty("wfsProtocolParams") && analysisData[i].hasOwnProperty("wfsLayerParams")) {
                    // also now need to make sure that the data has not already been added to the map
                    if (!layerExists(analysisData[i].wfsName)) {
                        console.log("creating protocol...");
                        protocol = new OpenLayers.Protocol.WFS(analysisData[i].wfsProtocolParams);
                        analysisData[i].wfsLayerParams.protocol = protocol;
                        console.log("creating layer...");
                        lyr = new OpenLayers.Layer.Vector(analysisData[i].wfsName, analysisData[i].wfsLayerParams);
                        lyr.displayInLayerSwitcher = false;
                        console.log("adding layer to map ..");
                        lyr.display(false);
                        map.addLayer(lyr);                    }
                }
            }
            console.log("analysis data has been added");
        }

        /**
         * Identify all the data that is to be used in this analysis
         * Each entry in the analysisData array is made up of a data object
         * that may or may not have the following elements:
         *
         *      wmsName:    <the name / label assigned to the wms layer.>
         *                  if this value is missing blank, null or otherwise
         *                  undefined the wms layer will not be created!
         *
         *      wmsURL:     <the url to the wms service>
         *
         *      wmsParams:  <an object with the properties that get
         *                  passed directly to the params portion of the
         *                  openlayers wms constructor (represent the
         *                  GetMap query string and parameter values)
         *
         *     wmsOptions:  The last object that gets sent to the openlayers
         *                  wms constructor.  Contains the extra options that
         *                  can be used to contruct a WMS layer.
         *
         *     wfsName:     The name of the WFS that will be created using the
         *                  WFS parameters If this value is missing blank null or
         *                  undefined a wfs layer will not get created even if the
         *                  other parameters required to create it are present.
         *
         *    wfsProtocolParams: These are the options that are used to create a
         *                  wfs protocol object.
         *
         *   wfsLayerParams: These are the parameters that are used to create a wfs
         *                 vector layer from the wfs protocol object.
         *
         * filter:   Define any filters that should be applied to the data,
         *                 if there are more than one then tie then make this
         *                 property equal to a Logical filter type that encloses
         *                 the multiple conditions
         *
         * summary column: This is the column in the table
         *                 associated with this layer that will
         *                 be summarized by the report.
         */
        function defineAnalysisData() {
            // TODO: more parameters to be added to this data structure to support
            //       reporting.  Example which column from the data set should be
            //       used to amalgamate the data.
            var ds1, ds2;
            ds1 = {
                wmsName : 'Mule Deer Risk',
                wmsURL : gce_wms,
                wmsParams : {
                    layers : 'cum_effects:mule_deer',
                    STYLES : '',
                    format : 'image/png',
                    tiled : true,
                    tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom,
                    transparent : true
                },
                wmsOptions : {
                    opacity : 0.35,
                    buffer : 0,
                    displayOutsideMaxExtent : true,
                    isBaseLayer : false
                },
                wfsName : 'Mule Deer WFS',
                wfsProtocolParams : {
                    url : gce_wfs,
                    version : "1.1.0",
                    featureType : "mule_deer",
                    featurePrefix : 'cum_effects',
                    srsName : webMercatorProj
                },
                wfsLayerParams : {
                    styleMap : wfsStyleMap,
                    strategies : [new OpenLayers.Strategy.BBOX()],
                    projection : new OpenLayers.Projection(webMercatorProj) //EPSG:4326  EPSG:900913 This is how the coordinates will be served
                },
                filter : new OpenLayers.Filter.Comparison({
                    type : OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                    property : 'RISK',
                    value : 'NOT APPLICABLE'
                }),
                summaryColumn : "RISK"
            };
            // ds2 = {
                // wmsName : 'Study Area Boundary',
                // wmsURL : gce_wms,
                // wmsParams : {
                    // layers : 'cum_effects:study_bndry',
                    // STYLES : '',
                    // format : 'image/png',
                    // tiled : true,
                    // tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom,
                    // transparent : true
                // },
                // wmsOptions : {
                    // opacity : 0.35,
                    // buffer : 0,
                    // displayOutsideMaxExtent : true,
                    // isBaseLayer : false
                // }
            // };
            //analysisData = [ds1, ds2];
            analysisData = [ds1];
        }

        function addCumEffectsLayers_WMS() {
            var i, lyr, url;
            console.log("analysisData" + analysisData)
            for ( i = 0; i < analysisData.length; i += 1) {
                if (analysisData[i].hasOwnProperty("wmsName") &&
                    analysisData[i].hasOwnProperty("wmsURL") &&
                    analysisData[i].hasOwnProperty("wmsParams") &&
                    analysisData[i].hasOwnProperty("wmsOptions")) {
                    lyr = new OpenLayers.Layer.WMS(analysisData[i].wmsName, analysisData[i].wmsURL, analysisData[i].wmsParams, analysisData[i].wmsOptions);
                    console.log("getting url...");
                    map.addLayer(lyr);
                    // url = lyr.getFullRequestString();
                    //console.log("url for wms: " + lyr.getFullRequestString());
                    objectToConsole(lyr.params);

                }
            }
        }

        /**
         * 1) iterates through the features provided as an arg
         * 2) Uses JSTS to calculate portions that are inside
         *    submitted polygon,
         * 3) adds the intersected features to a new layer
         * 4) draws the new layer
         */
        function calcIntersection(srcLayer, summaryColumn, features) {
            // TODO: need to come back and add logic to make sure that we actually have a drawing feature to work with
            var i, jstsReader, intersectFeature_albers, intersectGeomString, intersectGeomAlbers,
                intersectJSTSGeom, albersProjection, intersectFeature, webMercatorProj, 
                curFeatureJSTSGeom, intersectGeom, sumObj, sumColumnValue, area,
                totalAreaInInterest, cloneGeom;
            totalAreaInInterest = 0;
            console.log("processing this number of features: " + features.length);
            jstsReader = new jsts.io.WKTReader();

            intersectFeature = drawingLayer.features[0];
            
            
            // Very friggin strange.  Even though this feature gets removed somehow it get remembered
            // and the second time through the loop the transform function was working on a feature
            // that was already being transformed.
            cloneGeom = intersectFeature.geometry.clone();
            
            
            console.log("feature geometry before transform: " + intersectFeature.geometry.toString());
            console.log('number of features in drawing layer: ' + drawingLayer.features.length)
            cloneGeom.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection(albersProj));
            intersectGeomString = cloneGeom.toString();
           
            intersectJSTSGeom = jstsReader.read(intersectGeomString);
            console.log("intersectGeomString: " + intersectGeomString);

            albersProjection = new OpenLayers.Projection(albersProj);
            webMercatorProj = new OpenLayers.Projection('EPSG:900913');
            sumObj = {};
            for ( i = 0; i < features.length; i += 1) {
                // forces coordinate conversion to albers.  Allows area calculations to match the
                // area calculations of the underlying GIS system.
                // if the geometry was printed now will return in albers coordinates.
                features[i].geometry.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection(albersProj));
                //console.log("curfeature: " + jstsReader.read(features[i].geometry.toString()));
                curFeatureJSTSGeom = jstsReader.read(features[i].geometry.toString());
                consoleAreaReport(features[i], 'Shape_Area', 'ATT_2_VAL');
                // is it contained?
                if (intersectJSTSGeom.contains(curFeatureJSTSGeom)) {
                    // just add it to the new layer
                    console.log("feature is contained!");
                    area = features[i].geometry.getArea();
                    // use whole polygon
                } else if (intersectJSTSGeom.intersects(curFeatureJSTSGeom)) {
                    console.log("intersects!");
                    // calc intersection
                    intersectGeom = intersectJSTSGeom.intersection(curFeatureJSTSGeom);
                    area = intersectGeom.getArea();
                } else {
                    console.log("Toss it!");
                    area = 0;
                }
                console.log("area: " + area);
                // just draw linework, then tie the selected geometries to D3 Visualization
                // below
                // a) need to use jsts to calculate the area and linework for a data
                //    object that can be consumed by d3
                // b) add the d3 visualizations
                // c) down the road make dynamic so that user can edit the selection polygon
                //    live and have the data change live.
                if (area > 0) {
                    sumColumnValue = features[i].attributes[summaryColumn];
                    if (!sumObj.hasOwnProperty(sumColumnValue)) {
                        sumObj[sumColumnValue] = area;

                    } else {
                        sumObj[sumColumnValue] = sumObj[sumColumnValue] + area;
                    }
                    console.log(sumColumnValue + ' = ' + area);
                }

                // TODO: create new geometry of the analysis area

                // now create the report:
                totalAreaInInterest = totalAreaInInterest + area;
            }
            
            console.log("totalAreaInInterest:" + totalAreaInInterest);
            console.log("submitted poly area: " + intersectFeature.geometry.getArea())

            // Now calculate the area that falls outside polygons in this layer.
            if (totalAreaInInterest < intersectFeature.geometry.getArea()) {
                sumObj['undefinedArea'] = intersectFeature.geometry.getArea() - totalAreaInInterest;
            }
            console.log("finished!");

            // in order to style things correctly need to retrieve the styling
            // used for the layer on the wms server.  Don't know quite how to do
            // this through the openlayers interface, but it looks like
            // the following url will retrieve that file for a particular layer
            // next step is to take what is retreived by that and parse it using
            // the parser.
            cloneGeom.destroy();
            makeD3Report(srcLayer, sumObj, 'undefinedArea');
        }
        
        /**
         * @param {String} lyrName - The name of the layer that is to be reported on
         * @param {Object} areaReport - An object who's key values / properties contain
         *                              the attribute values of the layer while the 
         *                              values contain the area that the submitted
         *                              polygon overlaps with for the particular
         *                              attribute.
         * Example areaReport...
         *  {'LOW': 242342, 
         *   'MODERATE', 989122, 
         *    'HIGH', 53925633 }
         * 
         */
        function makeD3Report(lyrName, areaReport, keyValueForUndefinedArea) {
            // step 1 define an xmlhttp request, and a handler.  The handler
            // will then parse the
            var sld,  styles, reportData, reportRecord, configObj;
            console.log("layer name is: " + lyrName);
            sld = getSLD(lyrName);
            styles = extractStylesFromSLD(sld, lyrName);
            // can now make the report
            console.log("area report is: ")
            objectToConsole(areaReport);
            console.log("styles extracted from SLD:");
            objectToConsole(styles);
            // restructure the styles object and the areaReport into a list 
            // of objects with the following properties:
            // label: the attribute value that is being reported
            // area: the area in the submitted polygon that have the value described
            //       in the property label
            // color: the color that this attribute is being shaded as.
            
            // then create a config object with the following properties:
            // label: The name of the layer that is being reported on.
            // units: The unit of measurement used for the area column
            // anchorPrefix: used internally, must be unique for each layer.
            // TODO: consider autocalculating anchorPrefix
            // TODO: Currently set up to only report on one data layer.  will modify to be 
            //       able to report on many layers.
            reportData = [];
            reportRecord = combineSLDandReportData(areaReport, styles, lyrName, keyValueForUndefinedArea);
            console.log("*****************************************");
            console.log("        DEBUG STUFF!");
            console.log("*****************************************");
            console.log("data to report on is: " + reportRecord);
            objectToConsole(reportRecord);
            configObj = {};
            configObj.label = lyrName;
            configObj.units = 'hectares';
            configObj.anchorPrefix = 'muleDeer';
            // add the report tothe div=reportMainPanel 
            updateBackgroundProcessingStatus("drawing chart...", true);
            pieChart.reset();
            pieChart.addData(reportRecord, configObj);
            pieChart.createCharts('reportMainPanel');
            updateBackgroundProcessingStatus("Complete!", false)
        }
        
        function combineSLDandReportData(areaReport, styles, lyrName, keyValueForUndefinedArea) {
            var keys, i, atribVal, record, data;
            data = [];
            keys = Object.keys(areaReport);
            for (i=0; i<keys.length; i++) {
                atribVal = keys[i];
                if (atribVal === keyValueForUndefinedArea) {
                    // TODO: figure out later how to report out on areas not in a layer, just skipping for now
                }
                else if (!styles.hasOwnProperty(atribVal)) {
                    console.warn( "Attribute value: " + atribVal + ' is not described in the sld for the layer - ' + lyrName);
                }
                else if (!styles[atribVal].hasOwnProperty('fillColor')) {
                    console.warn( "The sld object for the attribute (" + atribVal + ") does not have a property called fillColor, but it should!");
                } else {
                    record = {};
                    record.label = atribVal;
                    record.area = areaReport[atribVal] / 10000;
                    record.color = styles[atribVal].fillColor
                    data.push(record);
                }
            }
            return data;
        }
        
        /**
         * takes an OpenLayers sld object and a layer name, parses the sld object 
         * extracting individual attribute values and the associated colors used
         * to symbolize them in the map.
         * 
         * returns an object who's keys/property names are the individual values from 
         * one of the layers attributes, the values are an object with two properties, the 
         * stroke color and the fill color.
         */
        function extractStylesFromSLD(sld, lyrName) {
            var rules, i, rule, columnValue, styles, defaultFill, defaultStroke;
            styles = {};
            rules = sld.namedLayers[lyrName].userStyles[0].rules;
            // get the defaults
            defaultFill = sld.namedLayers[lyrName].userStyles[0].defaultStyle.fillColor;
            defaultStroke = sld.namedLayers[lyrName].userStyles[0].defaultStyle.strokeColor;
            for ( i = 0; i < rules.length; i += 1) {
                if (rules[i].hasOwnProperty('filter')) {
                    columnValue = rules[i].filter.value;
                    styles[columnValue] = {
                        fillColor : defaultFill,
                        strokeColor : defaultStroke
                    };
                    if (rules[i].hasOwnProperty('symbolizer')) {
                        if (rules[i].symbolizer.hasOwnProperty('Polygon')) {
                            if (rules[i].symbolizer.Polygon.hasOwnProperty('fillColor')) {
                                //fill = rules[i].symbolizer.Polygon.fillColor;
                                styles[columnValue].fillColor = rules[i].symbolizer.Polygon.fillColor;
                            } else if (rules[i].symbolizer.Polygon.hasOwnProperty('strokeColor')) {
                                //stroke = rules[i].symbolizer.Polygon.strokeColor;
                                styles[columnValue].strokeColor = rules[i].symbolizer.Polygon.strokeColor;
                            }
                        }
                    }
                }
            }
            return styles;
        }
        
        /** 
         * Recieves a layer name, using the layer name assembles a request to 
         * geoserver for the associated SLD that contains the color map used
         * to symbolize the features of the layer. 
         *
         * @param {String}  lyrName - The name of the WMS layer for which we 
         *                            want to retrieve the associated SLD.
         * @return - an OpenLayers sld object.
         */
        function getSLD(lyrName) {
            var sldFormat, request, sld;
            request = OpenLayers.Request.GET({
                url : gce_ows + '?service=WMS&version=1.1.1&request=GetStyles&layers=' + lyrName,
                async : false
            });
            sldFormat = new OpenLayers.Format.SLD();
            sld = sldFormat.read(request.responseXML || request.responseText);
            return sld;
        }

        /**
         * used for debugging area of a feature.  Takes a
         * feature and reports on its area, by comparing area
         * calculated from geometries against the area in a column
         * in the data.
         */
        function consoleAreaReport(feature, areaColumn, featureIdColumn) {
            var albersProjection, webMercatorProj, jstsGeom, jstsReader;
            albersProjection = new OpenLayers.Projection(albersProj);
            webMercatorProj = new OpenLayers.Projection('EPSG:900913');

            jstsReader = new jsts.io.WKTReader();
            // This must act on the actual feature and not just return a value as it changes the
            // return value of feature.getarea() ...

            jstsGeom = jstsReader.read(feature.geometry.toString());
            console.log("--------------------------------------------------");
            console.log("OpenLayers getarea():             " + feature.geometry.getArea());
            console.log("OpenLayers getGeodesicArea():     " + feature.geometry.getGeodesicArea(webMercatorProj));
            //console.log("OpenLayers getarea() alb:         " + albersGeom.getArea());
            //console.log("OpenLayers getGeodesicArea() alb: " + albersGeom.getGeodesicArea());
            console.log("jsts getArea()              :     " + jstsGeom.getArea());
            console.log("Area Column                 :     " + feature.attributes[areaColumn]);
            console.log("feature id column           :     " + feature.attributes[featureIdColumn]);
        }

        function calcDiff(area1, area2) {
            var diff, large, percentdiff;
            diff = area1 - area2;
            large = area2;
            if (area1 > area2) {
                large = area1;
            }
            percentdiff = (diff * 100) / large;
            return percentdiff;

        }

        function test_adddummyPolygon() {
            var wktParser, wktpoly, feat1;
            if ( typeof (drawingLayer) === "undefined") {
                addDrawingLayer();
            }
            wktParser = new OpenLayers.Format.WKT();
            //wktpoly = "POLYGON((-13454551.096475 6371596.6845817,-13448206.823128 6372208.1808079,-13439531.220419 6369838.6329314,-13434983.217236 6363723.6706694,-13450347.05992 6359443.197086,-13454551.096475 6371596.6845817))";
            //wktpoly = 'POLYGON((-13449725.413772 6367813.0525681,-13446285.747499 6367277.9933702,-13446438.621556 6365175.9750926,-13447317.647381 6364182.2937251,-13449801.8508 6364411.6048099,-13450986.624738 6366360.7490309,-13449725.413772 6367813.0525681))';
            wktpoly = 'POLYGON((-13449687.195257 6367583.7414833,-13447661.614008 6367583.7414833,-13446400.403042 6365672.8157764,-13446438.621556 6364067.6381827,-13449648.976743 6364220.5122392,-13450910.18771 6366055.0009178,-13449687.195257 6367583.7414833))';
            feat1 = wktParser.read(wktpoly);
            drawingLayer.addFeatures([feat1]);
            console.log("finished adding polygon")
        }

        /**
         * Remove all the polygons in the drawing layer
         */
        mapObj.clearAOI = function clearAOI() {
            var elem;
            if ((typeof drawingLayer).toString() !== 'undefined')  {
                drawingLayer.removeAllFeatures();
                console.log("number of features in drawing layer is: " + drawingLayer.features.length);
            }
            // check and see if there is a chart from a previously 
            // run report and remove it!
            elem = document.getElementById('reportMainPanel');
            elem.innerHTML = '';
            while (elem.lastChild) {
                svg.removeChild(svg.lastChild);
            }
            pieChart.reset();
        };

        function createIdentifyControl() {
            infoControl = new OpenLayers.Control.WMSGetFeatureInfo({
                url : gce_wms,
                title : 'Identify features by clicking',
                queryVisible : true,
                eventListeners : {
                    getfeatureinfo : function(event) {
                        console.log("got here");
                        map.addPopup(new OpenLayers.Popup.FramedCloud("chicken", map.getLonLatFromPixel(event.xy), null, event.text, null, true));
                    }
                }
            });
            console.log("info control created");
            map.addControl(infoControl);
            infoControl.activate();
        }


        mapObj.identify = function identify() {
            // need to figure out how to query layers on the map now
            console.log("idenfify is:" + infoControl);
            if ( typeof (infoControl) === 'undefined') {
                console.log("creating the controls");
                createIdentifyControl();
            }
            console.log('info ctrl activated');
            infoControl.activate();
        };

        function createIdentifyControl_old() {
            var wmsControlParams, wmsClickEventListener;

            wmsControlParams = {
                autoActivate : false,
                infoFormat : "application/vnd.ogc.gml",
                maxFeatures : 3,
                url : gce_wms,
                title : "Click on Feature!",
                layers : ['mule_deer'],
                queryVisible : true
            };
            wmsClickEventListener = {

                getfeatureinfo : function(event) {
                    console.log("click event has been recieved");
                    var items = [];
                    map.addPopup(new OpenLayers.Popup.FramedCloud("chicken", map.getLonLatFromPixel(event.xy), null, event.text, null, true));
                }
            };
            wmsControlParams.eventListener = wmsClickEventListener;
            infoControl = new OpenLayers.Control.WMSGetFeatureInfo(wmsControlParams);
            map.addControl(infoControl);
            console.log("info control created");
        }

        function AnalysisDataSelectionCallBack(response) {
            // TODO: should come back and add a visual widget to show that processing is taking place behind the scenes.
            // read from the response and send the features to the
            // intersect method.
            console.log("AnalysisDataSelectionCallBack called");
            var srcLayer, analysisDataRec;
            updateBackgroundProcessingStatus("Calculating Area Intersections...", true);
            if (response.error) {
                //TODO: should figure out what to do if an error is encountered here. Exceptions?
                objectToConsole(response);
                console.log("error with the WFS query");
                console.log(response.error);
                console.log(response.error.exceptionReport.exceptions[0]);
                console.log(response.error.exceptionReport.exceptions[0].texts[0]);
            }
            console.log("Callback called!");
            // its ugly and risky but this looks like the only way I can see to get the
            // layer from the response object
            srcLayer = response.features[0].fid.split('.')[0];
            console.log("layername.fid:" + srcLayer);

            console.log("elements in response: " + response.features.length);
            // now send the features to the intersection method
            analysisDataRec = getAnalysisDataRecordFromFeatureType(srcLayer);

            calcIntersection(srcLayer, analysisDataRec.summaryColumn, response.features);
        }

        function getAnalysisDataRecordFromFeatureType(layerName) {
            var lyrs, i, name, lyrName, summCol, analysisDataRec;
            analysisDataRec = undefined;
            lyrs = map.getLayersByClass('OpenLayers.Layer.Vector');
            for ( i = 0; i < analysisData.length; i += 1) {
                if (analysisData[i].hasOwnProperty('wfsProtocolParams')) {
                    name = analysisData[i].wfsProtocolParams.featureType;
                    if (name === layerName) {
                        console.log("found layer!");
                        //lyrName = 'wfsName';
                        analysisDataRec = analysisData[i]
                        break;
                    }
                }
            }
            return analysisDataRec;
        }
        
        mapObj.reportOnDrawing = function reportONDrawing() {
            var i, wfsConfigs, protocol, atribFilter, wfsConfig, spatialFilterParams,
                spatialFilter, filter;
            wfsConfigs = getWFSProtocolConfigs();
            console.log('wfsConfigs' + wfsConfigs);
            objectToConsole(wfsConfigs);
            for (i=0; i<wfsConfigs.length; i+=1) {
                wfsConfig = wfsConfigs[i].wfsProtocolParams;
                protocol = new OpenLayers.Protocol.WFS(wfsConfig);
                spatialFilterParams = {
                    type : OpenLayers.Filter.Spatial.INTERSECTS,
                    value : drawingLayer.features[0].geometry,
                    projection : new OpenLayers.Projection(webMercatorProj)
                };
                spatialFilter = new OpenLayers.Filter.Spatial(spatialFilterParams);
                if (wfsConfigs[i].hasOwnProperty("filter")) {
                    filter = new OpenLayers.Filter.Logical({
                                filters : [wfsConfigs[i].filter, spatialFilter],
                                type : OpenLayers.Filter.Logical.AND
                            });
                } else {
                    filter = spatialFilter;
                }
                protocol.read({
                    filter: filter, 
                    callback: AnalysisDataSelectionCallBack
                });
                // when finished with the protocol call protocol.destroy();
            }
        };

        /**
         * This method is called after a drawing polygon has been defined.  The method
         * does the following:
         *  a) makes sure the WFS layers exist, but readying the analysisData object
         *     and adding any wfs layers that are defined there but not already
         *     available to the map.
         * b) creates a filter for all the analysis WFS layers.  The filter that
         *    is created will either combine logic described in the  analysisData object,
         *    with a spatial filter using the polygon that was just drawn, or if no
         *    filter criteria has been defined it will simply add the spatial filter
         * c) gets the layer with the name described in the property wfsName in the
         *    analysisData object, and assigns the filter to the wfs protocol, and
         *    also adds the callback AnalysisDataSelectionCallBack
         */
        mapObj.reportOnDrawing_old = function reportOnDrawing_old() {
            // get the information underneath the drawn polygon with a
            // wfs query in a web worker
            // A) define a filter
            var i, junk, drawingGeom, spatialFilterParams, filter_spatial, compObj, 
                filter_conditional, allfilters, filterComb, dataDict, atribFilter,
                filters, finalFilter, layers;
            filters = [];
            // TODO: THis next method needs to be changed so that it queries through the protocol instead of adding a wfs layer.  This should 
            //       make it much more efficient.  Try setting the format to JSON.
            addAnalysisData();
            //test_adddummyPolygon();
            drawingGeom = drawingLayer.features[0].geometry;
            console.log("drawinglayer geom is:" + drawingGeom);

            spatialFilterParams = {
                type : OpenLayers.Filter.Spatial.INTERSECTS,
                value : drawingGeom,
                projection : new OpenLayers.Projection(webMercatorProj)
            };

            filter_spatial = new OpenLayers.Filter.Spatial(spatialFilterParams);
            // iterate over the analysis data struct, looking for filter defs.  if any
            // are found they are created, and the joined to the spatial filter above using
            // 'and' logic
            for ( i = 0; i < analysisData.length; i += 1) {
                dataDict = analysisData[i];
                // only want to apply filters on WFS layers.  Use the presence of
                // wfsName to identify whether a layer is a wfs layer or not
                if (dataDict.hasOwnProperty("wfsName")) {
                    // make sure the filter param is defined.
                    if (dataDict.hasOwnProperty("filter")) {
                        atribFilter = dataDict.filter;
                        filters.push(filter_spatial);
                        filters.push(dataDict.filter);
                        finalFilter = new OpenLayers.Filter.Logical({
                            filters : filters,
                            type : OpenLayers.Filter.Logical.AND
                        });
                    } else {
                        finalFilter = filter_spatial;
                    }
                    // finally apply the filter to any read requests.
                    // a) get the layer with the name === dataDict.wfsName
                    // b) from that layer get the protocol object
                    // c) apply to the protocol object this callback
                    layers = map.getLayersByName(dataDict.wfsName);
                    if (layers.length > 1) {
                        // houston we have a problem!  For this app going to keep
                        // layer names unique.  Should not get a layer with the same name
                        // TODO: need to figure out how JS likes to do errors and exceptions  Add in the appropriate exception here
                        console.log("ERROR:found (" + layers.length + ") than one layer with this name: " + dataDict.wfsName);
                    } else {
                        // from the layer get the protocol
                        layers[0].protocol.read({
                            filter : finalFilter,
                            callback : AnalysisDataSelectionCallBack
                        });
                    }
                }
            }

            // compObj = {
            // type : OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
            // property : 'RISK',
            // value : 'NOT APPLICABLE'
            // };
            //filter_conditional = new OpenLayers.Filter.Comparison(compObj);
            // allfilters = [filter_spatial, filter_conditional];
            // filterComb = new OpenLayers.Filter.Logical({
            // filters : allfilters,
            // type : OpenLayers.Filter.Logical.AND,
            // });
            //
            // console.log("filter enabled!");

            // going to read the features from the vector layer that
            // wraps the wfs protocol.  Down the road look into whether it is
            // significantly more efficient to read straight from the protocol object.
            //muleDeerProtocolWFS.read({
            //    filter : filterComb,
            //    callback : WFSReadCallBack
            //});
            //for ()

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
        
        mapObj.drawSubmitAndVisualize = function drawSubmitAndVisualize(drawMethod) {
            updateBackgroundProcessingStatus('Draw the AOI...', true);
            mapObj.clearAOI();
            mapObj.drawAOI(drawMethod);
        };

        /**
         * Adds a list of basemaps to the map.  Currently set up to
         * add the options of osm, and google for basemaps.  Down the road
         * may wish to add more.
         * @param {Object} layer2Add
         */
        mapObj.addBaseMaps = function addBaseMaps(layer2Add) {
            // TODO: add in functionality allowing the addition of a set of base layers using the args sent.
            var gmapStreet, lyrs2add, gmapHybrid, gmapsat, osmLayer;
            lyrs2add = [];
            if (layer2Add === "undefined") {
                layer2Add = 'osm';
            }
            if (layer2Add === 'osm') {
                console.log("adding osm base layer");
                osmLayer = new OpenLayers.Layer.OSM();

                osmLayer.projection = new OpenLayers.Projection("EPSG:3857");
                lyrs2add.push(osmLayer);
                //map.addLayers([osmLayer]);
            }

            gmapStreet = new OpenLayers.Layer.Google("Google Streets", {
                numZoomLevels : 20
            });

            gmapHybrid = new OpenLayers.Layer.Google("Google Hybrid", {
                //visibility : false,
                type : google.maps.MapTypeId.HYBRID,
                numZoomLevels : 23,
                MAX_ZOOM_LEVEL : 22
            });

            console.log("here");
            // map.addLayers([gmap]);

            gmapsat = new OpenLayers.Layer.Google('Google Satellite', {
                type : google.maps.MapTypeId.SATELLITE,
                numZoomLevels : 23,
                MAX_ZOOM_LEVEL : 22
            });
            lyrs2add.push(gmapStreet);
            lyrs2add.push(gmapHybrid);
            lyrs2add.push(gmapsat);
            lyrs2add.push(osmLayer);
            map.addLayers(lyrs2add);
            map.setBaseLayer(gmapHybrid);
            map.baseLayer = gmapHybrid;
            addCumEffectsLayers_WMS();
        };

        mapObj.addMapControls = function addMapControls() {
            var mousePositionControl;

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
            mousePositionControl = new OpenLayers.Control.MousePosition();
            mousePositionControl.displayProjection = new OpenLayers.Projection(webMercatorProj);
            // EPSG:900913 EPSG:4326
            map.addControl(mousePositionControl);
            map.addControl(new OpenLayers.Control.KeyboardDefaults());
            map.addControl(new OpenLayers.Control.Navigation({
                dragPan : new OpenLayers.Control.DragPan(),
                zoomWheelEnabled : true,
                autoActivate : true
            }));
        };

        mapObj.initMap = function(piechrt, Spinner) {
            // recieving a reference to the pieChart api.
            pieChart = piechrt;
            // OSM uses projection 3857, but there is no def available for this so
            // manually adding it.
            Proj4js.defs["EPSG:3857"] = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

            console.log("map is getting initialized...");
            var options = {
                projection : new OpenLayers.Projection(webMercatorProj),
                units : 'm',
                maxResolution : 156543.0339,
                maxExtent : new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
                controls : []
            };
            map = new OpenLayers.Map('map', options);
            defineAnalysisData();

            mapObj.addBaseMaps('osm');

            map.setCenter(new OpenLayers.LonLat(-120.75, 49.53).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 12);
            console.log("done initialation");
        };

        return mapObj;

    }(maplib || {}));

