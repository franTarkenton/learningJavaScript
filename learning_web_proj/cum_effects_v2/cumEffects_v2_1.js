/**
 *  re-worked the code that was originally in v2 to 
 *  be more modular, and hopefully easier to read and 
 *  understand.
 *  @namespace cumuEff
 * 
*/

var cumuEff = ( function (OpenLayers, pieChart, Proj4js) {
    "use strict";
    OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
    var mapLib, drawingLayerName, gce_ip, gce_domain, gce_wfs, gce_wms, gce_ows,
        albersProj, webMercatorProj, mapInitParams, map;
    
    mapLib = {};
    
    /** populates module level variables that are used to 
     *  wms and wfs servers, projections etc.  
     * @name cumuEff.defineParams
     * @function 
     * @memberof cumuEff
     * @private
     */
    function defineParams() {
        // temporary drawing layer parameters
        drawingLayerName = 'tempdrawings';
        
        // Google compute engine paramaters
        gce_ip = '173.255.119.161';
        gce_domain = 'subban.no-ip.biz';
        gce_wfs = "http://" + gce_domain + "/geoserver/wfs";
        gce_wms = "http://" + gce_domain + "/geoserver/wms";
        gce_ows = "http://" + gce_domain + "/geoserver/ows";
        
        // projection related paramters, demo of how to document it in jsdoc
        /** 
         * @var {string} albersProj
         * @description epsg code for bc albers
         * @memberof cumuEff
         * @private
         */
        albersProj = 'EPSG:3005';
        
        webMercatorProj = 'EPSG:900913';
        // parameters that are required to do the actual translation using proj4js
        Proj4js.defs["EPSG:3857"] = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
    
        /** 
         * @var {object} mapInitParams
         * @description an openlayers map option object ( http://dev.openlayers.org/docs/files/OpenLayers/Map-js.html#OpenLayers.Map.OpenLayers.Map )
         * @property {object} projection - an Openlayers projection object @link http://dev.openlayers.org/docs/files/OpenLayers/Projection-js.html
         * @property {string} units - the map units to use.
         * @property {number} maxResolution - The maximum resolution
         * @memberof cumuEff
         * @private
        */
        mapInitParams = {
            projection : new OpenLayers.Projection(webMercatorProj),
            units : 'm',
            maxResolution : 156543.0339,
            maxExtent : new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            controls : []
        };
    }
    
    /**
     * instantiates an openlayers map. 
     * @name initOpenLayersMap
     * @function 
     * @memberof cumuEff
     * @private
     */
    function initOpenLayersMap() {
        map = new OpenLayers.Map('map', mapInitParams);
        
    }
    
    /** 
     * @name  mapLib.initMap
     * @function
     * @description populates a bunch of configuration variables then creates 
     *      an openlayers map in the variable map
     * @memberof cumuEff
     * @public
     */
    mapLib.initMap = function () {
        defineParams();
        initOpenLayersMap();
    };
    
    
}(OpenLayers, pieChart, Proj4js, mapLib, config));
