
var cntrlFunction = function ($scope, $routeParams, $location, runReportFactory, productConfig) {
    $scope.a = 5;
    $scope.b = 6; //reportConfigController
    firstChart = true;
    
    var getDateObj = function() {
        var dateObj = {};
        
        dateObj.today = function() {
            dateObj.dt = new Date();
        };
        dateObj.today();
        dateObj.showWeeks = true;
        dateObj.toggleWeeks = function() {
            dateObj.showWeeks = ! $scope.showWeeks;
        };
        dateObj.clear = function() {
            dateObj.dt = null;
        };
        dateObj.disabled = function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };
        dateObj.toggleMin = function() {
            dateObj.minDate = ( dateObj.minDate ) ? null : new Date();
        };
        dateObj.toggleMin();
        
        dateObj.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
    
            dateObj.opened = true;
        };
      
        dateObj.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };
        
        dateObj.dateYearCeil = function() {
            year = dateObj.dt.getFullYear();            
            dateObj.dt.setMonth(11);
            dateObj.dt.setDate(31);
            console.log("year: " + year);
        };
        
        dateObj.dateYearFloor = function() {
            year = dateObj.dt.getFullYear();            
            dateObj.dt.setMonth(0);
            dateObj.dt.setDate(1);
            console.log("year: " + year);
        };
        
        
        dateObj.getStringDate = function() {
            // YYYY-MM-DD HH24:MI:SS
            stringDate = dateObj.dt.getFullYear() + '-' + 
                         dateObj.dt.getMonth() + '-' + 
                         dateObj.dt.getDate() + ' ' + 
                         dateObj.dt.getHours() + ':' + 
                         dateObj.dt.getMinutes() + ':' + 
                         dateObj.dt.getSeconds();
            return stringDate;
        };
        
        dateObj.getUTCDate = function() {
            var utc;
            utc = Date.UTC(dateObj.dt.getFullYear(), 
                            dateObj.dt.getMonth(),
                            dateObj.dt.getDate(),
                            dateObj.dt.getHours(),
                            dateObj.dt.getMinutes(), 
                            dateObj.dt.getSeconds());
            return utc
        };
        
        
        
        dateObj.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
        dateObj.format = dateObj.formats[0];
        console.log("format date: " + dateObj.format);
        return dateObj;
    };
    
    $scope.startDate = getDateObj();
    $scope.startDate.dateYearFloor();
    
    $scope.endDate = getDateObj();
    $scope.endDate.dateYearCeil();
    
    $scope.reportResolution = {};
    $scope.reportResolution.values = ['second', 'minute', 'hour', 'day', 'month', 'year'];
    $scope.reportResolution.selected = 'day';
    $scope.reportResolution.checkModel = {second: false,
                                          minute: false,
                                          hour: false, 
                                          day: true, 
                                          month: false, 
                                          year: false};
    
    console.log("date is: " + $scope.startDate.dt);
    
    $scope.go = function ( path ) {
        console.log("path is: " + path);
        $location.path( path );
    };
    
    function requestReportData(product) {
    	console.log("product in the requestReportData is " + product);
    	// now request the report data for that product.
    	var startDate, endDate, reportResolution, utcStart, utcEnd;
        console.log("running the report");
        startDate = $scope.startDate.getStringDate();
        endDate = $scope.endDate.getStringDate();
        reportResolution = $scope.reportResolution.selected;
        console.log("start date is: " + startDate);
        console.log("end date is:" + endDate);
        
        utcStart = $scope.startDate.getUTCDate();
        utcEnd =  $scope.endDate.getUTCDate();
        console.log('utcStart' + utcStart);
        console.log('utcEnd' + utcEnd);
        $scope.showprogress = true;
        //$scope.progressMessage = 'Getting data... (can take a few minutes)'
        //$scope.progressbarState = 5;
        $scope.chartObject = {};
        firstChart = true;

    	chartDataObject = runReportFactory.query( {'startDate': utcStart, 
		                         'endDate': utcEnd, 
		                         'reportResolution': reportResolution,
		                         'product': product} );
		                         
		chartDataObject.$promise.then(function(chartDataObject) {
			if (firstChart === true) {
				console.log("Have the data for the first chart now!:");
				firstChart = false;
				$scope.chartObject = chartDataObject;
				console.log("chart data is: " + JSON.stringify(chartDataObject));
			} else {
				// adding data to the chart.
				console.log("need to update the chart data with the data that has been returned");
		        console.log('data to be appended is', JSON.stringify(chartDataObject));
		        //$scope.chartObject.data = chartDataObject.data;
		        updateDataTable(chartDataObject);
			}
		});
		chartDataObject.$promise['finally']( function(data) {
			$scope.showprogress = false;
		});
		
    }
    
    function updateDataTable(updateData) {
    	// need to rip through the update data and add a row to the 
    	// data that exists in the struct $scope.chartObject
    	//cols":[{"type":"string","id":"sample_time","label":"Sample Time"},{"type":"number","id":"EDITOR_used","label":"EDITOR"}]}
    	// dealing with the columns!
    	var i, j;
    	console.log("updating the column info...")
    	for (i=0; i<updateData.data.cols.length; i+=1) {
    		curColLabel = updateData.data.cols[i].label;
    		if (curColLabel !== 'Sample Time') {
    			newCol = updateData.data.cols[i]
    			$scope.chartObject.data.cols.push(newCol);
    		}
    	}
    	sampleTimeDict = {};
    	// dealing with the rows:
    	// start by creating a dictionary that allows me to the corresponding
    	// position in the rows data struct of a specific sample time.
    	// it also allows us to test to see if a sample time exists or not.
		for (j=0; j<$scope.chartObject.data.rows.length; j+=1) {
			sampleTime = $scope.chartObject.data.rows[j].c[0].v;
			$scope.chartObject.data.rows[j].c.push({"v":0});
			sampleTimeDict[sampleTime] = j;
		}
		// get the column position the new data should be inserted into
    	thisRowPosition = $scope.chartObject.data.rows[0].c.length - 1;
    	console.log("postion is: " + thisRowPosition);
    	
    	
    	for (i=0; i<updateData.data.rows.length; i+=1) {
    		sampleTime1 = updateData.data.rows[i].c[0].v;
    		licenseUsed = updateData.data.rows[i].c[1];
    		// if the date has an entry in the current data struct enter it here.
    		if (sampleTimeDict.hasOwnProperty(sampleTime1)) {
    			rowCnt = sampleTimeDict[sampleTime1]
    			//console.log('row: ' + $scope.chartObject.data.rows[rowCnt] + ' j: ' + rowCnt);
    			$scope.chartObject.data.rows[rowCnt].c[thisRowPosition] = licenseUsed;
    		}
    		// new row needs to be inserted for the specific date
    		for (j=0; j<$scope.chartObject.data.rows.length; j+=1) {
    			curSampleTime = $scope.chartObject.data.rows[j].c[0];
    			if (curSampleTime > sampleTime1) {
    				// insert a row in here, add that logic!
    				// TODO: add logic to insert row here
    				
    			}
    			
    		}
 
    	};
    	
    	console.log("appended data is:" + JSON.stringify($scope.chartObject));
    	
    }
    
    $scope.runReport = function () {
        var startDate, endDate, reportResolution, utcStart, utcEnd;
        console.log("running the report");
        startDate = $scope.startDate.getStringDate();
        endDate = $scope.endDate.getStringDate();
        reportResolution = $scope.reportResolution.selected;
        console.log("start date is: " + startDate);
        console.log("end date is:" + endDate);
        
        utcStart = $scope.startDate.getUTCDate();
        utcEnd =  $scope.endDate.getUTCDate();
        console.log('utcStart' + utcStart);
        console.log('utcEnd' + utcEnd);
        $scope.showprogress = true;
        $scope.progressMessage = 'Getting data... (can take a few minutes)'
        $scope.progressbarState = 100;
        
        // First request the products from the database
        $scope.products = productConfig.query();
        
        // once the products have been resolved execute this function
        $scope.products.$promise.then(function(data) {
        	for (var i=0; i<data.length; i+=1) {
        		$scope.progressMessage = 'Getting license data for ( ' + $scope.products[i]['data'] + ' ) ';
        		progress = Math.round(((i + 1) * 100 ) / data.length);
        		$scope.progressbarState = progress;
        		console.log('progress is:' + progress);
        		console.log('product: '+ data[i]['data'] + ' ' + $scope.products[i]['data']);
        		// now request the report data for the current product
        		requestReportData($scope.products[i]['data']);
        	}
        	
   		});
        console.log("here now");
        
        
        // This stuff works, but need to fix it up so that the async update
        // of the chart works!
        // $scope.products = productConfig.query(function() {
        	// console.log('got the products!');
        	// for (var i=0; i<$scope.products.length; i+=1) {
        		// console.log("  product:" + $scope.products[i]['data']);        	
	        	// $scope.chartObject = runReportFactory.query(
		                                // {'startDate': utcStart, 
		                                // 'endDate': utcEnd, 
		                                // 'reportResolution': reportResolution,
		                                // 'product': $scope.products[i]['data']}, function() {
		            // var i, j, row, chartData;
		            // //chartData = restructData($scope.reportData);
		            // //$scope.chartObject = $scope.reportData;
		            // console.log('chartObject');
		            // console.log(JSON.stringify($scope.chartObject));
		            // $scope.showprogress = false;
		        // });
	        // }
//         	
//         	
        // });
        
        
        
        
        // TODO: modify this query to run a separate query per product
        // $scope.products = productConfig.query( function() {
            // console.log("products:" + $scope.products );
	        // $scope.reportData = runReportFactory.query(
	                                // {'startDate': utcStart, 
	                                // 'endDate': utcEnd, 
	                                // 'reportResolution': reportResolution}, function() {
	            // var i, j, row, chartData;
	            // console.log("report data: " + $scope.reportData);
	            // //chartData = restructData($scope.reportData);
	            // $scope.chartObject = $scope.reportData;
	            // console.log('chartObject');
	            // console.log(JSON.stringify(chartData));
	            // $scope.showprogress = false;
	        // });
        // ) ;
    };
    
    function restructData(inData) {
    	var cnt, retData, i, keys, j, dataTabCols, dataTabVals;
    	dataTabCols = [];
    	dataTabVals = [];
    	console.log("indata is:" + inData);
    	// deal with the columns
    	for (i=0; i<inData.length; i+=1) {
    		keys = Object.keys(inData[i]);
    		
    		//console.log("keys: " + keys )
    		//for (j=keys.length-1; j>=0; j-=1) {
    	    for (j=0; j<keys.length; j+=1) {
    			colRow = {};
    			console.log(keys[j] + " : " + inData[i][keys[j]]);
    			colRow.id = [keys[j]];
    			colRow.label = [keys[j]];
    			if (keys[j] === 'sample_time') {
    				colRow.type = 'string';
    			} else if (keys[j] === 'lic_used'){
    				colRow.type = 'number';
    			}
    			else {
    				console.log('888888888888888888888888888888888888888');
    			}
    			console.log("---------------------")
    			console.log("id: " + colRow.id);
    			console.log("label: " + colRow.label);
    			console.log("type is " + colRow.type);
    			
    			dataTabCols.push(colRow);
    		}
    		break;
     	}
     	
    	// now deal with row data
    	for (i=0; i<inData.length; i+=1) {
    		keys = Object.keys(inData[i]);
    		rowData = {};
    		rowData.c = [];
    		console.log("new row of data");
    		//console.log("keys: " + keys )
    		//for (j=keys.length-1; j>=0; j-=1) {
    		for (j=0; j<keys.length; j+=1) {
    			value = {};
    			value.v = inData[i][keys[j]];
    			console.log("  "  + keys[j] + ' : ' + value.v + ' (' + typeof value.v + ') ');
    			rowData.c.push(value);
    		}
    		dataTabVals.push(rowData);
    	}
    	
    	
    	// stuff to figure out how to dynamically configure later on
    	retData = {};
    	retData.type = "LineChart";
    	retData.displayed = true;
    	retData.title = 'graph chart title';
    	retData.data = {cols:dataTabCols, rows:dataTabVals};
    	retData.options = {
    		title: 'my first chart',
    		isStacked: true,
    		fill: 20,
    		displayExactValues: true,
    		vAxis: {
    			title: 'vaxis Title',
    			gridlines: {
    				count: 10
    			}
    		},
    		hAxis: {
    			title: 'horizontal Title'
    		}
    	};
    	retData.formatters = {};
    	return retData;
    };
    
    function showChart() {
        $scope.chart = '';
    }
    
    // $scope.open = function() {
        // var modelInstance = $modal.open({
            // templateUrl: 'app/partials/backendConfig.html', 
            // controller: backendCtrl,
            // resolve: $scope.
//                 
//             
        // })
        
   //};//
   
   // progress bar stuff
   $scope.progressBarType = 'info';
   $scope.showWarning = true;
   $scope.showprogress = false;
   $scope.progressbarState = 0;
   $scope.progressMessage = '';
   
   // the chart data table
   $scope.chartObject = undefined;
   
};

ESRIStatsApp.controller('reportConfigController', ['$scope', '$routeParams', '$location', 'runReportFactory', 'productConfig', cntrlFunction]);
