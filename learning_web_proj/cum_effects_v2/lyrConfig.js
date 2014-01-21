/**
 * 
 * an api to make it easier to identify what the base layers are that 
 * are part of the application
 * @namespace lyrConfig
 */
lyrConfig = (function(google) {
    'use strict';
	var lyrConfig, googleMapTypes;
	lyrConfig = {};
    
    
    /**
     * returns an array of objects that describing the different 
     * google maps that can be used as base maps
     * @name lyrConfig#getGoogleMapTypeConfigs
     * @function
     * @private
     */
    function getGoogleMapTypeConfigs() {
        var types, streetMaps, hybrid;
        types = [];
        streetMaps = {
            label: 'Google Streets',
            params: {
                numZoomLevels: 23
            }};
        hybrid = {
            label: 'Google Hybrid',
            params: {
                type : google.maps.MapTypeId.HYBRID,
                numZoomLevels : 23,
                MAX_ZOOM_LEVEL : 22
            }
        };
        sat = {
            label: 'Google Satellite', 
            params: {
                type : google.maps.MapTypeId.SATELLITE,
                numZoomLevels : 23,
                MAX_ZOOM_LEVEL : 22
            }
        }
        return [streetMaps, hybrid, sat];
    }
    
    /**
     * test method does this work in jsdoc
     * @name lyrConfig#testMethod
     * @function
     */
    lyrConfig.testMethod = function () {
        console.log("nothing")
    };
    

	return lyrConfig;
}(google));