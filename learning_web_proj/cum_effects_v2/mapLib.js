/**
 * abstracted api used to manage the map object 
 * Used in conjunction with a param object.  The param object
 * contains all the configuration, this module simply consumes 
 * the configurations.
 * @namesapce mapLib
 *  
 */

var mapLib = (function(config) {
    "use strict";
    var mapObj, map;
    
    mapObj = {};
    
    mapObj.initMap = function () {
        map =  new OpenLayers.Map(config.mapDiv, config.mapOptions);
    };
    
    return mapObj;
    
}(config));
