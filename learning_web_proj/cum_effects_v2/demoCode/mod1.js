var mod1 = (function ( m2 ) {
    "use strict";
    var mod1;
    mod1 = {};
    
    mod1.publicFunc = function(){
        privateMethod1();
    }; 
    
    mod1.printMod2Property = function() {
        m2.printProperty();
    };
 
    return mod1;
 
// module2 namespace is inserted into m2, the arg that is recieved at the start of 
// this module declaration.
})( module2);
 