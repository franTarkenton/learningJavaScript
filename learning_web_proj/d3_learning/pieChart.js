/**
 * @module pieChart
 * 
 * Used to report out on map polygon selections.  Idea is in 
 * the mapping component the user will select an area of interest, 
 * The mapping widget will construct a series of data strucutres that 
 * can be passes to this module to be visualized.
 * 
 * In the end the visualization will show charts for selected polygons
 * as well as summary statistics about the polygon that was used to 
 * select the polygons.
 */

var pieChart = (
    function() {"use strict";

        var pieChrt, angleScale, svg, pi, i, radianOffSet, svgWidth, 
            svgHeight, minimumChartSize, spaceBetween, chartWidth, chartHeight,
            dataRadiusScale, minChrtDims,  percent2WidthDim, 
            percent2HeightDim, numCols, numRows ;
        pieChrt = {}; // namespace
        pieChrt.chartDataSets = []; // populated with an array of data sets.  Each element in this array  represents a chart to be drawn
        pieChrt.chartConfigs = []; // populated with an array of config parameters
        minChrtDims = 150;
        spaceBetween = 5;
        
        
        
        
        /** 
         * When this method is called we know how many charts need to get created.  This method
         * will calculate the width and height of each chart and store this information in the
         * chartWidth and chartHeight variables
         */
        function defineChartSize() {
            var  whitespace; 
            console.log("width is: " + svgWidth);
            // Can't forsee a situation where we would have more than 10 charts per column. 
            // norm is likely 2 - 4.
            numCols = Math.floor(svgWidth / minChrtDims); // 2
            // space between each column and chart
            whitespace = spaceBetween * (numCols + 1);
            console.log("whitespace: " + whitespace);
            chartWidth = Math.floor((svgWidth - whitespace) / numCols);
            
            // numRows = (minChrtDims * Math.ceil(pieChrt.chartDataSets.length / numCols));
            numRows = Math.ceil(pieChrt.chartDataSets.length / numCols);
            console.log("numRows: " + numRows);
            console.log("numCols" + numCols);
            
            // svg height should be at whatever the chartWidth is * the number of rows 
            // required
            if (numCols > pieChrt.chartDataSets.length) {
                //svgHeight = minChrtHeight + (2 * spaceBetween);
                svgHeight = chartWidth
            } else {
                //svgHeight = (minChrtHeight * Math.ceil(pieChrt.chartDataSets.length / numCols)) + (2 * spaceBetween);
                svgHeight = numRows * chartWidth;
            }
            //console.log("svg height is: " + svgHeight);
            // easiest to keep the charts a square, so...
            chartHeight = chartWidth + 0;
        }
        
        /**
         * gets a count indicating what chart is being draw.  Ie is it the first second
         * third etc.  Based on that value and the number of rows and columns to be drawn 
         * calculates offset coordinates as to where the chart should go. 
         */
        function getChartLocation(chartCnt) {
            var rowCnt, colCnt, offsets;
            // chartCnt is an array index so adding 1.
            chartCnt += 1
            rowCnt = Math.ceil(chartCnt / numCols);
            if (chartCnt <= numCols) {
                colCnt = chartCnt;
            } else {
                colCnt = chartCnt%numCols;
                if (colCnt === 0) {
                    colCnt = 1;
                } else {
                    colCnt = colCnt + 1;
                }
            }
            offsets = {};
            offsets.x = colCnt * chartWidth;
            offsets.y = rowCnt * chartHeight;
            console.log("x: " + offsets.x);
            console.log("y: " + offsets.y);
            return offsets;
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
            console.log("chartHeight: " + chartHeight);
            console.log("chartWidth: " + chartWidth);
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
            dataRadiusScale = d3.scale.linear().domain([0, data.length ]).range([percent2WidthDim(15), percent2HeightDim(70)]);
            //dataRadiusScale = d3.scale.linear().domain([0, data.length ]).range([20, 100]);
            
            console.log('100 width:' + percent2WidthDim(100));
            console.log('100 height' + percent2HeightDim(100));
            console.log('100 radius ' + dataRadiusScale(3))
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
        
        /**
         * creates an invisible arc upon which the labelling can be placed 
         *  
         */
        function defineLabelArc(data) {
            var arc, d, i, val;
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
                          return 0 + radianOffSet;
                      });
            return arc;
        }
        
        
        /**
         * @param {Object[]} data
         * @param {String} data.label - The value that will be used to label the axis
         * @param {number} data.area - Contains the area that will be represented in the chart
         * @param {String} data.color - Hexidecimal number representing the color to be used to draw the value
         * 
         * @param {Object} arc - a d3 svg arc that is used to define a path along which the data will be 
         *                       shaded.
         * @param {Object} grpElem - A d3 grouped element that the arcs of data will be added to.  The arc object
         *                           defines the path, this element is a grouped element that will get created by
         *                           d3.  It will have the arcs that are used to visualize the data.
         * @param {Object} offsets
         * @param {number} offsets.x - The number of units from the x axis that coordinates should be
         *                                   shifted in order to draw this element in the correct 
         *                                   location.
         * @param {number} offsets.y - Ditto as above but for Y.
         */
        function drawDataArc(data, arc, grpElem, offsets) {
            grpElem.selectAll('path')
                .data(data)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('id', function(d, i) {
                    return i;
                })
                .style('fill', function(d) {
                    return d.color;
                })
                .attr("transform", 'translate('+ offsets.x +', '+ offsets.y +')'); // 300, 200
                //.attr("transform", 'translate('+ chartWidth +', '+ chartHeight +')'); // 300, 200
        }
        
        function drawLabelDataArc(data, arc, dataLabelArc, offsets) {
            // start by drawing the hidden arc
            dataLabelArc.selectAll('path')
                .data(data)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('id', function(d, i) {
                    return 'lab' + i;
                })
                .style("opacity", 0.5) // needs to be edited after debugging
                .attr('transform', 'translate('+ offsets.x + ',' + offsets.y + ')');
        }
        
        function defineGroupedElements() {
            var groups = {};
            groups.dataArcs = svg.append('g');
            groups.textArc = svg.append('g');
            groups.dataLabelArc = svg.append('g');
            return groups;
        }
        
        /** 
         * draws the chart based on the contents of the data.
         * @param {Object[]} data
         * @param {String} data.label - The value that will be used to label the axis
         * @param {number} data.area - Contains the area that will be represented in the chart
         * @param {String} data.color - Hexidecimal number representing the color to be used to draw the value
         * 
         */
        function drawChart(dataPosition) {
            var data = pieChrt.chartDataSets[dataPosition];
            var offsets = getChartLocation(dataPosition);
            var groups = defineGroupedElements();
            
            // drawing the data
            var dataArc = defineDataArc(data);
            drawDataArc(data, dataArc, groups.dataArcs, offsets);
            
            // labelling the data
            var labelArc = defineLabelArc(data);
            drawLabelDataArc(data, labelArc, groups.dataLabelArc, offsets);
            
            
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
                
            console.log("svg width:" + svgWidth);
            console.log("svg height:" + svgHeight);
            
                
            // Iterating over the data used to draw each chart.
            for (i=0; i<pieChrt.chartDataSets.length; i++) {
                configureScaleFunctions(pieChrt.chartDataSets[i]);
                drawChart(i);
            }

            
        };

        return pieChrt;
    }());
