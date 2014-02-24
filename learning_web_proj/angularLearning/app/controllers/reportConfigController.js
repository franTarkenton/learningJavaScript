
var cntrlFunction = function ($scope, $routeParams, $location, runReportFactory) {
    $scope.a = 5;
    $scope.b = 6; //reportConfigController
    
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
    
    $scope.runReport = function () {
        var startDate, endDate, reportResolution, utcStart, utcEnd;
        console.log("running the report");
        startDate = $scope.startDate.getStringDate();
        endDate = $scope.endDate.getStringDate();
        reportResolution = $scope.reportResolution.selected
        console.log("start date is: " + startDate);
        console.log("end date is:" + endDate);
        
        utcStart = $scope.startDate.getUTCDate()
        utcEnd =  $scope.endDate.getUTCDate()
        console.log('utcStart' + utcStart);
        console.log('utcEnd' + utcEnd);
        $scope.showprogress = true;
        $scope.progressMessage = 'Getting data... (can take a few minutes)'
        $scope.progressbarState = 100;
        // TODO: modify this query to run a separate query per product
        $scope.reportData = runReportFactory.query(
                                {'startDate': utcStart, 
                                'endDate': utcEnd, 
                                'reportResolution': reportResolution}, function() {
            var i, j, row;
            // $scope.reportData array of objects!  
            //   [  {0: <date>, 1:<number>}]
            
            
            
            for ( i=0; i<$scope.reportData.length; i+=1) {
                vals = '';
                keys = Object.keys($scope.reportData[i])
                for ( j=0; j<keys.length; j++) {
                    vals = vals + ' - ' + $scope.reportData[i][j]
                }
                
                console.log("vals: " + vals);
                
                console.log("keys " + keys )
            }
            console.log('report data: ' + $scope.reportData);
        });
        
        // $scope.reportData = runReportFactory.query({'startDate': utcStart, 
                                // 'endDate': utcEnd, 
                                // 'reportResolution': reportResolution});
//         
        
    };
    
    function showChart() {
        $scope.chart = {
            type: 'LineChart',
            displayed: true, 
            data: '',
            rows: 
        }
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
   
   
   
   
};

ESRIStatsApp.controller('reportConfigController', ['$scope', '$routeParams', '$location', 'runReportFactory', cntrlFunction]);
