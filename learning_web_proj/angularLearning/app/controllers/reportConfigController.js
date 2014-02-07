
var cntrlFunction = function ($scope, $routeParams, $location) {
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
    
    // $scope.open = function() {
        // var modelInstance = $modal.open({
            // templateUrl: 'app/partials/backendConfig.html', 
            // controller: backendCtrl,
            // resolve: $scope.
//                 
//             
        // })
        
   //};//
    
};

ESRIStatsApp.controller('reportConfigController', ['$scope', '$routeParams', '$location', cntrlFunction]);
