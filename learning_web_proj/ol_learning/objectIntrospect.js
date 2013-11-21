/** 
 * @module explore object
 */

var indentationNum = 0;
var indentiationMult = 4;
var indentChar = " ";


function printObj(inObject) {
	// Gets an object and will iterate throught he properties of the 
	// object
	
	iterateObj(inObject);
}

function incrementIndentation() {
	indentationNum = indentationNum + indentiationMult;
}

function decrementIndentation() {
	indentationNum = indentationNum - indentiationMult;
}

function getIndentation() {
	var indent = "";
	for (var i=0; i<indentationNum; i++) {
		indent = indent + indentChar;
	}
	return indent;
}


function iterateObj(inObj) {
	var indent = getIndentation();
	var type = toType(inObj);
	//console.log(indent + 'type: ' + type);
	if (type === 'object') {
		var keys = getKeys(inObj);
		console.log(indent + 'keys:' + keys);
		for (var i=0; i<keys.length; i++) {
			console.log(indent + "key: " + keys[i]);
			incrementIndentation();
			iterateObj(inObj[keys[i]]);
			decrementIndentation();
		}
	} else if (type === 'undefined'){
		console.log(indent + "not object:" + inObj);
	} else if (type === 'array') {
		for (var j=0; j<inObj.length; j++) {
			incrementIndentation();
			//var stringVer = JSON.stringify(inObj[j]);
			//console.log(indent + 'array val:' + stringVer);
			iterateObj(inObj[j]);
			decrementIndentation();
		}
	} else {
		console.log(indent + 'type:' + type);
		console.log(indent + "val: " + inObj)
	}
}


function getKeys(inObject) {
	var keys = [];
	for (var key in inObject) {
		keys.push(key);
	}
	return keys;
}

var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}






