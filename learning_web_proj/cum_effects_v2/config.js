/**
 * 
 * an api to make it easier to identify what the base layers are that 
 * are part of the application
 * @namespace lyrConfig
 */
var lyrConfig = (function(google) {
    'use strict';
	var lyrConfig, googleMapTypes;
	lyrConfig = {};
    
    // the name of the div to place the map object into
    lyrConfig.mapDiv = 'map';
    lyrConfig
    
    
   /** 
    * @typedef googleMapConfigsArray
    * @type {object}
    * @property {string} label - The name for the type of map
    * @property {object} params - object that can be fed to the options parameter when creating a google layer.
    * @property {number} params.numZoomLevels - number of zoom levels to use for this basemap
    * @property {number} params.MAX_ZOOM_LEVEL - The maximum number of allowable zoom levels
    * @property {object} params.type - The google map type.  see @link https://developers.google.com/maps/documentation/javascript/maptypes#BasicMapTypes
    */
    
    /**
     * returns an array of objects that describing the different 
     * google maps that can be used as base maps
     * @name lyrConfig#getGoogleMapTypeConfigs
     * @function
     * @private
     * @returns {googleMapConfigsArray} an object describing the different google map layers to create.
     * @memberof lyrConfig 
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
    
    function getDefaultMapConfig() {
        // returns an Openlayers.Map options object which is used to 
        // initialize a map.
    }
    
    
    /**
     * @name  test2
     * @function
     * @memberof lyrConfig
     */
    lyrConfig.test2 = function (test) {
        console.log("nothing");
    };
    
    
    /**
     * test method does this work in jsdoc
     * @name lyrConfig#testMethod
     * @function
     * @param {Object} test
     * @param {String} test.param1 - This is a parameter
     * @param {number} test.param2 - another examples
     * @memberof lyrConfig
     */
    lyrConfig.testMethod = function (test) {
        console.log("nothing")
    };
    

	return lyrConfig;
}(google));