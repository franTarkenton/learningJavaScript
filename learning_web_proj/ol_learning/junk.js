/** 
 * @module explore object
 */

function printObj(inObject) {
	// Gets an object and will iterate throught he properties of the 
	// object
	var type = toType(inObject);
	console.log('type: ' + type);
}

var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}






