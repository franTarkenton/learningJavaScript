var cntrlFunction = function ($scope) {
    var i;
    
    var getListObject = function() {
        var listObj = {};
        listObj.data = [];
        listObj.selected = null;
        listObj.value2Add = null;
        
        listObj.add = function(data) {
            listObj.data = data;
        };
        
        listObj.deleteSelected = function() {
            console.log('sel: ' + listObj.selected); 
            for ( i=0; i<listObj.data.length; i+=1) {
                if (listObj.productSelected === listObj.data[i]) {
                    listObj.data.splice(i, 1);
                    listObj.selected = listObj.data[0];
                }
            }
        };
        
        productInfo.add = function() {
            console.log("value to enter is: " + listObj.value2Add);
            if (listObj.value2Add !== null) {
                listObj.value2Add = listObj.value2Add.trim();
                if (listObj.value2Add !== null && listObj.value2Add !== '') {
                    console.log("valeu to enter is: " + listObj.value2Add);
                    listObj.data.push(listObj.value2Add);
                }
            }
            listObj.value2Add = null;
        };
        return productInfo;
    };
    
    var productInfo = {};
    
    productInfo.products = ['ARC/INFO', 'EDITOR', 'VIEWER'];
    productInfo.productSelected = productInfo.products[0];
    productInfo.deleteSelectedProduct = function() {
        console.log('sel prod' + productInfo.productSelected); 
        for ( i=0; i<productInfo.products.length; i+=1) {
            if (productInfo.productSelected === productInfo.products[i]) {
                productInfo.products.splice(i, 1);
                productInfo.productSelected = productInfo.products[0];
            }
        }
    };
    productInfo.value2Add = null;
    productInfo.addProduct = function() {
        console.log("valeu to enter is: " + productInfo.value2Add);
        if (productInfo.value2Add !== null) {
            productInfo.value2Add = productInfo.value2Add.trim();
            if (productInfo.value2Add !== null && productInfo.value2Add !== '') {
                console.log("valeu to enter is: " + productInfo.value2Add);
                productInfo.products.push(productInfo.value2Add);
            }
        }
        productInfo.value2Add = null;
    };
    
    
    
    $scope.productInfo = productInfo;
    
    var users = {};
    
    users.usersOmit = ['HPRARC', 'REPLICAT','WINS', 'SYSTEM',
                        'SRMOIAS', 'ESRI'];
    users.userSelected = users.usersOmit[0];
    
    $scope.tmpTablePrefix = 'esritmp_';
    
    $scope.deleteSelectedProduct = function() {
    };
    
    $scope.add;
                         
};

ESRIStatsApp.controller('backEndConfigCtrl', [ '$scope', cntrlFunction]);
