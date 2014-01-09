var pieChart = (
    function() {"use strict";

        var pieChrt, angleScale, svg, pi, i, radianOffSet, numColumns, svgWidth, 
            svgHeight, minimumChartSize, spaceBetween, chartWidth, chartHeight,
            dataRadiusScale, minChrtWidth, minChrtHeight, percent2WidthDim, 
            percent2HeightDim, ;
        pieChrt = {}; // namespace
        pieChrt.chartDataSets = []; // populated with an array of data sets.  Each element in this array  represents a chart to be drawn
        pieChrt.chartConfigs = []; // populated with an array of config parameters
        numColumns = 2;  // identifies how many charts to draw in the width provided for the svg
        minChrtWidth = 150;
        minChrtHeight = 125;
        spaceBetween = 5;
        
        
        
        /** 
         * When this method is called we know how many charts need to get created.  This method
         * will calculate the width and height of each chart and store this information in the
         * chartWidth and chartHeight variables
         */
        function defineChartSize() {
            var numCols, whitespace; 
            console.log("width is: " + svgWidth);
            // Can't forsee a situation where we would have more than 10 charts per column. 
            // norm is likely 2 - 4.
            numCols = Math.floor(svgWidth / minChrtWidth);
            // space between each column and chart
            whitespace = spaceBetween * (numCols + 1);
            chartWidth = (svgWidth - whitespace) / numCols;
            
            if (numCols < pieChrt.chartDataSets.length) {
                svgHeight = minChrtHeight + (2 * spaceBetween);
            } else {
                svgHeight = (minChrtHeight * Math.ceil(pieChrt.chartDataSets.length / numColumns)) + (2 * spaceBetween);
            }
            chartHeight = minChrtHeight;
        }
        
        /**
         * @param {Object[]} data
         * @param {String} data.label - The value that will be used to label the axis
         * @param {number} data.area - Contains the area that will be represented in the chart
         * @param {String} data.color - Hexidecimal number representing the color to be used to draw the value
         */
        function configureScaleFunctions(data) {
            var max, maxDomain;
            // Step 1, calculate the domain of the data.
            console.log("here");
            var max = d3.max(data, function(d, i) {
                return d.area;
            });
            var maxDomain = calcMaxDomainValue(max);
            
            // Step 2,  create various calculators to translate between data values, 
            //          and angles, radian that are used to represent them on the screen.
            //  2a. angle scale - calculates angle based on a data value.
            angleScale = d3.scale.linear().domain([0, maxDomain]).range([0, 1 * Math.PI]);
            //  2b. scale starts at 270 through to 90. - radian offset is 90 degrees in radians
            radianOffSet = 90 * (Math.PI / 180);
            // Always want to express dimensions from here on forth as percentages of 
            // the total size allocated for the chart.  This function will translate 
            // percentage values to chart dimensional units.
            percent2WidthDim = d3.scale.linear().domain([0, 100]).range([0, chartWidth]);
            percent2HeightDim = d3.scale.linear().domain([0, 100]).range([0, chartHeight]);

            //  2c. radius scale, used to calculate minium and maxium raduses for arcs
            //       input values are percentages.
            dataRadiusScale = d3.scale.linear().domain([0, data.length ]).range([percent2WidthDim(20), percent2WidthDim(70)]);
            
            
            console.log('100 width:' + percent2WidthDim(100));
            console.log('100 height' + percent2HeightDim(100));
            console.log('100 radius ' + dataRadiusScale(100))
            
        }
        
        /**
         * caluclates the number of digits in the number, then creates an integer by 
         * dividing the number by 10 to the number of digits -1.  calclates the ceiling 
         * of that number. 
         */
        function calcMaxDomainValue(val) {
            var numDig, num, ceilNum;
            numDig = val.toString().length;
            num = val / Math.pow(10, numDig - 1);
            ceilNum = Math.ceil(val / Math.pow(10, numDig - 1)) ; // * Math.pow(10, numDig - 1)
            //console.log("numDig:" + numDig + ' ceilNum:' + ceilNum);
            if (ceilNum <= 5) {
                ceilNum = 5 * Math.pow(10, numDig - 1);
            } else {
                ceilNum = 10 * Math.pow(10, numDig - 1);
            }
            return ceilNum;
        }
        
        /**
         * creates an arc that the data can be drawn on. 
         */
        function defineDataArc(data) {
            var arc, val, i, d;
            arc = d3.svg.arc().innerRadius(function(d, i) {
                          val = 0;
                          if (i !== 0) {
                              val = dataRadiusScale(data[i - 1].area);
                          }
                          return dataRadiusScale(i) + 1;
                      }).outerRadius(function(d, i) {
                          return dataRadiusScale(i + 1) - 1;
                      }).startAngle(function(d, i) {
                          return 0 - radianOffSet;
                      }).endAngle(function(d, i) {
                          console.log("end data: " + val);
                          console.log("rads:" + angleScale(d.area));
                          return angleScale(d.area) - radianOffSet;
                      });
            return arc;
        }
        
        function defineGroupedElements() {
            dataArc = svg.append('g');
            textArc = svg.append('g');
            majorTicsArc = svg.append('g');
            minorTicsArc = svg.append('g');
            labelsGroup = svg.append('g');
            
            ticTextGroup = svg.append('g');
            ticTextArc = svg.append('g');
            ticTextPath = svg.append('g');
            
            ticUnitsTextPathGroup = svg.append('g');
            ticUnitsTextGroup = svg.append('g');
        }
        
        /** 
         * draws the chart based on the contents of the data.
         * @param {Object[]} data
         * @param {String} data.label - The value that will be used to label the axis
         * @param {number} data.area - Contains the area that will be represented in the chart
         * @param {String} data.color - Hexidecimal number representing the color to be used to draw the value
         * 
         */
        function drawChart(data) {
            defineGroupedElements();
            var dataArc = defineDataArc(data);
            
            
        }
        
        function debug_drawCircles() {
            var dataset = [ 5, 10, 15, 20, 25 ];
            console.log("drawing now");
            var circles = svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle");
                
            circles.attr("cx", function(d, i) {
                return (i * 50) + 25;
            })
                .attr("cy", 200/2)
                .attr("r", function(d) {
                return d;
            });
        }

        /**
         * Adds data that is used to create a chart. Can be called many times in order to 
         * Output a svg with multiple charts.
         * 
         * @param {Object[]} inputData
         * @param {String} inputData.label - The label for a specific value in the chart
         * @param {number} inputData.area - The area that is to be represented in the chart.
         * @param {string} inputData.color - The hexidecimal color to be used to represent the value
         * 
         * @param {Object} config
         * @param {String} label - The label that should be used to label the chart. (what is the chart representing)
         * @param {String} units - The units that the area values are to be provided in. (allowable values m, ha)
         *                
         */
        pieChrt.addData = function(inputData, config) {
            // TODO: should do some verification that the object complies with the required schema
            pieChrt.chartDataSets.push(inputData);
        };
        
        /**
         * using the data that has been added to this object using the method addDataObj
         * Will generate a chart for each piece of information.
         * 
         * @param {number} Width - The width in pixels of the output svg
         * @param {string} div - The div tag that identifies where in the html doc
         *                       the svg should be inserted.
         */
        pieChrt.createChart = function(w, div) {
            // width will be static, height will be dynamic depending on how many charts need to 
            // be drawn.  Will draw 2 charts per width for now.
            // create the svg that needs to be drawn
            svgWidth = w;
            defineChartSize(svgWidth);
            svg = d3.select('#' + div)
                .append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight);
            
                
            // Iterating over the data used to draw each chart.
            for (i=0; i<pieChrt.chartDataSets.length; i++) {
                configureScaleFunctions(pieChrt.chartDataSets[i]);
                drawChart(pieChrt.chartDataSets[i]);
            }

            
        };

        return pieChrt;
    }());
