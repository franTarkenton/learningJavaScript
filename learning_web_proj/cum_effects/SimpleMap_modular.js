// experimenting with creating modular code.
// self-invoking, anonymous function:

var maplib;
maplib = function() {

	var mapObj = {};

	// local variables
	var map;

	// example of local or private function:
	function someFunc() {
		var somevar = 1;
		// local variable
		console.log("somevar is now 1");
	};

	mapObj.printSomething = function printSomething() {
		console.log('hello got here hello');
		someFunc();
	};

	mapObj.addBaseLayer = function addBaseLayer(layer2Add) {
		var lyrs2add = []
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

	};

	mapObj.addMapControls = function addMapControls() {
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
	
	// cloud made fresh is a nice theme

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

};

