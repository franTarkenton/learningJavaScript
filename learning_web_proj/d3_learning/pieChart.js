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

        var pieChrt, angleScale, svg, pi, radianOffSet, svg, svgParams,
            minimumChartSize, spaceBetween, chartWidth, chartHeight,
            dataRadiusScale, minChrtDims,  percent2WidthDim, 
            percent2HeightDim, numCols, numRows, chartsPositionalInfo, 
            domainLabelValues, chartCircumfrence;
        
        pieChrt = {};
        
        function resetParams() {
             // namespace
            svgParams = {};
            pieChrt.chartDataSets = []; // populated with an array of data sets.  Each element in this array  represents a chart to be drawn
            pieChrt.chartConfigs = []; // populated with an array of config parameters
            minChrtDims = 300;
            spaceBetween = 7;
            chartsPositionalInfo = [];
            chartCircumfrence = 1;  // where 1 is 180 and 2 = 360 degrees.
            domainLabelValues = null;
            numRows = null;
            numCols = null;
            percent2HeightDim = null;
            percent2WidthDim = null;
            dataRadiusScale= null;
            chartHeight= null;
            chartWidth = null;
            minimumChartSize= null;
            svg= null;
            radianOffSet= null;
            pi = null;
            angleScale= null;
        }
        
        function objectToConsole(obj, indent) {
            // super handy method, don't want to lose this. Useful for debugging
            // and figuring out stuff.
            var keys, i, key, value, spaces, spacesInIndent, isObj, bracketStart, bracketEnd;
            spacesInIndent = 4;
            bracketStart = '{';
            bracketEnd = '}';
            if (typeof indent === 'undefined') {
                indent = 0;
            }
            isObj = false;
            //console.log(typeof indent);
            spaces = Array(indent).join(' ');
            //console.log("spaces: " + spaces);
            keys = Object.keys(obj);
            for ( i = 0; i < keys.length; i += 1) {
                key = keys[i];
                value = obj[key];
                if (( typeof value).toString() === 'object') {
                    if (Object.prototype.toString.call(value) === '[object Array]') {
                        bracketStart = '[';
                        bracketEnd = ']';
                    }
                    console.log(spaces + key + ' : ' + bracketStart);
                    indent = indent + spacesInIndent;
                    objectToConsole(value, indent);
                    indent = indent - spacesInIndent;
                    spaces = Array(indent).join(' ');
                    console.log(spaces + bracketEnd + ' ');
                } else {
                    console.log(spaces + key + ' : ' + value);
                }
            }
            if (isObj) {
                //indent = indent - spacesInIndent;
            }
        }
        
        /** 
         * When this method is called we know how many charts need to get created.  This method will 
         * populate the following information:
         * 
         * {Object} svgParams 
         * {number} svgParams.height - calculated based on how many charts can be fit in the 
         *                       width of the svg without violating the minimum chart 
         *                       size identified by the minChrtDims
         * {number} svgParams.width - This parameter should already have been populated. 
         * {number} svgParams.numCols - The number of columns
         * {number} svgParams.numRows - The number of rows
         * {number} svgParams.chartWidth - The width of each chart 
         * {number} svgParams.chartHeight - The height of each chart 
         * 
         * {Array} charts   - an array of chart objects
         * {Object} chart 
         * {number} chart.xmin - the west coordinate of the current chart
         * {number} chart.ymin - the northern most coordinate of the current chart
         * {number} chart.xmax - the eastern edge of the current chart
         * {number} chart.ymax - the southern most edge of the current chart.

         * 
         */
        function defineChartSize() {
            var  whitespace, i, chartWidth, charts, curX, curY, curCol, curRow, xmax, chrtDims; 
            console.log("width is: " + svgParams.width);
            // Can't forsee a situation where we would have more than 10 charts per column. 
            // norm is likely 2 - 4.
            svgParams.numRows = 1;
            svgParams.numCols = Math.floor((svgParams.width - spaceBetween)  / ( minChrtDims + spaceBetween ) ); // 2
            // TODO: for now going to just assume either a 180 or 360 degree chart.  Should really put in 
            //       logic that allows for any angle chart, and calculates the spacign for this correctly.
            svgParams.chartWidth = ( ( svgParams.width - spaceBetween - ( spaceBetween * svgParams.numCols ) ) / svgParams.numCols );
            svgParams.chartHeight = svgParams.chartWidth;
            if (chartCircumfrence <= 1) {
                svgParams.chartHeight = svgParams.chartHeight / 2;
            }
            
            // if there are 2 columns there will be space in between on the most left and right and the middle
            // upper left coordinates of the current chart.
            curX = spaceBetween;
            curY = spaceBetween;
            curCol = 1;
            curRow = 1;
            
            for (i=0; i<pieChrt.chartDataSets.length; i+=1) {
                xmax = spaceBetween + (curCol * spaceBetween) + (curCol * svgParams.chartWidth);
                console.log('xmax ' + xmax)
                if (xmax > svgParams.width) {
                    curCol = 1;
                    curRow += 1;
                    curX = spaceBetween;
                    curY = curY + spaceBetween + svgParams.chartHeight;
                    svgParams.numRows += 1;
                }
                chrtDims = {};
                chrtDims.xmin = Math.floor(curX);
                chrtDims.xmax = Math.floor(curX + svgParams.chartWidth);
                chrtDims.ymin = Math.floor(curY);
                chrtDims.ymax = Math.floor(curY + svgParams.chartHeight);
                
                console.log("chrtDims.xmin " + chrtDims.xmin);
                console.log("chrtDims.xmax " + chrtDims.xmax);
                console.log("chrtDims.ymin " + chrtDims.ymin);
                console.log("chrtDims.ymax " + chrtDims.ymax);

                curX = curX + spaceBetween + svgParams.chartWidth;
               
                chartsPositionalInfo.push(chrtDims);
                curCol += 1
            }
            svgParams.height = (( svgParams.numRows * spaceBetween ) + (svgParams.chartHeight * svgParams.numRows) ) + spaceBetween;
        }
        
        /**
         * in order to label the gauge need a data structure that can be used to 
         * assign the labels to. This method will calculate that data structure.
         */
        function calcDomainLabelValues(maxDomainValue) {
            var incrementValue, numDivisions, curVal, domainValueArray,
                miniDomainArray, miniIncr, miniCurVal, miniNumDivs, 
                domains;
            console.log("maxDomainValue: " + maxDomainValue);
            console.log("maxDomainValue length: " + maxDomainValue.toString().length);
            console.log("first number in maxDomainValue: " + maxDomainValue.toString()[0]);
            if (maxDomainValue.toString()[0] === '5') {
                numDivisions = 5;
                miniNumDivs = 10;
            } else {
                numDivisions = 10;
                miniNumDivs = 10;
            }
                
            console.log('divs are: ' +numDivisions);
            curVal = 0;
            domainValueArray = [];
            miniDomainArray = [];
            
            incrementValue = maxDomainValue / numDivisions;
            miniIncr = incrementValue / miniNumDivs;
            miniCurVal = miniIncr;
            while (curVal <= maxDomainValue) {
                domainValueArray.push(curVal);
                curVal += incrementValue;
                // console.log('curVal: ' + curVal);
                if (miniCurVal < maxDomainValue) {
                    while (miniCurVal < curVal ) {
                        miniDomainArray.push(miniCurVal);
                        miniCurVal += miniIncr;                   
                    }
                    miniCurVal += miniIncr;
                }
            }
            
            domains = {}
            domains.bigIncr = domainValueArray;
            domains.subIncr = miniDomainArray;
            return domains;
        }
        
        /**
         * @param {Object[]} data
         * @param {String} data.label - The value that will be used to label the axis
         * @param {number} data.area - Contains the area that will be represented in the chart
         * @param {String} data.color - Hexidecimal number representing the color to be used to draw the value
         */
        function configureScaleFunctions(i) {
            var max, maxDomain, data, chrtLoc;
            data = pieChrt.chartDataSets[i]
            chrtLoc = chartsPositionalInfo[i];
            // Step 1, calculate the domain of the data.
            console.log("------------------------------------------");
            console.log("chartHeight: " + svgParams.chartHeight);
            console.log("chartWidth: " + svgParams.chartWidth);
            var max = d3.max(data, function(d, i) {
                return d.area;
            });
            // calcs the largest value that will be used in the 
            // gauge scale. 
            var maxDomain = calcMaxDomainValue(max);
            console.log("maxDomain: " + maxDomain);
            domainLabelValues = calcDomainLabelValues(maxDomain);
            
            // Step 2,  create various calculators to translate between data values, 
            //          and angles, radian that are used to represent them on the screen.
            //  2a. angle scale - calculates angle based on a data value.
            angleScale = d3.scale.linear().domain([0, maxDomain]).range([0, chartCircumfrence * Math.PI]);
            //  2b. scale starts at 270 through to 90. - radian offset is 90 degrees in radians
            radianOffSet = 90 * (Math.PI / 180);
            // Always want to express dimensions from here on forth as percentages of 
            // the total size allocated for the chart.  This function will translate 
            // percentage values to chart dimensional units.
            percent2WidthDim = d3.scale.linear().domain([0, 100]).range([0, svgParams.chartWidth / 2 ]);
            // percent2HeightDim = d3.scale.linear().domain([0, 100]).range([0, svgParams.chartHeight / 2 ]);
            percent2HeightDim = d3.scale.linear().domain([0, 100]).range([0, svgParams.chartHeight / chartCircumfrence ]);
            
            //  2c. radius scale, used to calculate minium and maxium raduses for arcs
            //       input values are percentages.
            dataRadiusScale = d3.scale.linear().domain([0, data.length  ]).range([percent2WidthDim(15), percent2HeightDim(70)]);
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
                        if (val % 1 !== 0) {
                val = Math.round(val);
            }
            numDig = val.toString().length;

            console.log("val: " + val);
            console.log("typeof val: " + typeof val);
            console.log("numDig:" + numDig);

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
                          //console.log("end data: " + val);
                          //console.log("rads:" + angleScale(d.area));
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
                          return dataRadiusScale(i);
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
         * creates and returns a d3 arc that is used to draw the
         * big tics on the chart.  Big tics are the ones that extend 
         * into the data on the chart and beyond. 
         */
        function defineBigTicksArc() {
            var offset, retVal, ticsArc;
            offset = 1;
            ticsArc = d3.svg.arc()
                .innerRadius(percent2WidthDim(10))
                .outerRadius(percent2WidthDim(80))
                .startAngle(function(d, i) {
                    //return 0 - radianOffSet;
                    retVal = angleScale(d - offset) - radianOffSet;
                    //console.log("startAngle: " + retVal + ' ' + d);
                    return retVal;
                })
                .endAngle(function(d, i) {
                    //return 0 + radianOffSet;
                    var retVal = angleScale(d + offset) - radianOffSet;
                    //console.log("endAngle: " + retVal + ' '  + d);
                    return retVal
                });
            return ticsArc;
        }
        
        function defineGaugeLabelArc() {
             var ticUnitsTextArc = d3.svg.arc()
                .innerRadius(percent2WidthDim(75))
                .outerRadius(percent2WidthDim(80))
                .startAngle( angleScale(domainLabelValues.bigIncr[0]) - radianOffSet)
                .endAngle( angleScale(domainLabelValues.bigIncr[domainLabelValues.bigIncr.length - 1]) - radianOffSet);
            return ticUnitsTextArc;
        }
        
        function defineMiniTicksArc() {
            var offset, retVal, ticsArc;
            offset = 1;
            ticsArc = d3.svg.arc()
                .innerRadius(percent2WidthDim(72))
                .outerRadius(percent2WidthDim(78))
                .startAngle(function(d, i) {
                    //return 0 - radianOffSet;
                    retVal = angleScale(d - offset) - radianOffSet;
                    //onsole.log("startAngle: " + retVal + ' ' + d);
                    return retVal;
                })
                .endAngle(function(d, i) {
                    //return 0 + radianOffSet;
                    var retVal = angleScale(d + offset) - radianOffSet;
                    //console.log("endAngle: " + retVal + ' '  + d);
                    return retVal
                });
            return ticsArc;
        }
        
        function defineBigTicksLabelsArc() {
            var textOffset, startAngle, ticTextArc;
            // TODO: need to come back and calculate an appropriate text offset so it works always.
            // textOffset = 3000;
           //textOffset = 200000;
           textOffset = ( domainLabelValues.bigIncr[1] - domainLabelValues.bigIncr[0] ) / 4;
           // TODO: textOffset needs to be calculated dynamically in a way that ensures there is adequate room for the text labels.

            // A) define the arc
            ticTextArc = d3.svg.arc()
                .innerRadius(percent2WidthDim(85))
                .outerRadius(percent2WidthDim(90))
                .startAngle(function(d, i) {
                    //return 0 - radianOffSet;
                    
                    // if (i === 0) {
                        // textOffset = ( domainLabelValues.bigIncr[1] - domainLabelValues.bigIncr[0] ) / 3;
                    // } else if (i === domainLabelValues.bigIncr.length - 1) {
                        // textOffset = textOffset - textOffset;
                    // } else {
                        // textOffset = ( domainLabelValues.bigIncr[1] - domainLabelValues.bigIncr[0] ) / 3;
                    // }
                    //console.log("startAngle: " + startAngle);
                    startAngle = angleScale(domainLabelValues.bigIncr[i] - textOffset) - radianOffSet;
                    return startAngle;
                })
                .endAngle(function(d, i) {
                    return angleScale(domainLabelValues.bigIncr[i] + textOffset) - radianOffSet;
                });
            return ticTextArc;
        }
        
        /**
         * Recieves a chart Location object.  Using this and 
         * the total circumfrance of the current chart returns 
         * the offset coordinates for where the chart should be
         * positioned on the page. 
         */
        function caluclateXYOffsets(chrtLoc) {
            var xOffset, yOffset, offsets;
            offsets = {};
            offsets.x = ((chrtLoc.xmax - chrtLoc.xmin) / 2 ) + chrtLoc.xmin;
            offsets.y = ((chrtLoc.ymax - chrtLoc.ymin) ) + chrtLoc.ymin;
            if (chartCircumfrence > 1) {
                offsets.y = ((chrtLoc.ymax - chrtLoc.ymin) / 2) + chrtLoc.ymin;
            }
            console.log('xOffset ' + xOffset);
            console.log('yOffset ' + yOffset);
            return offsets;
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
        function drawDataArc(data, arc, grpElem, chrtLoc) {
            var offsets, transformText;
            offsets = caluclateXYOffsets(chrtLoc);
            transformText = 'translate('+ offsets.x +', '+ offsets.y +')';
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
                .attr("transform", transformText); // 300, 200
                //.attr("transform", 'translate('+ chartWidth +', '+ chartHeight +')'); // 300, 200
        }
        
        function drawLabelDataArc(data, arc, groups, chrtLoc, anchorText) {
            // start by drawing the hidden arc
            var offsets, transformText, labelText;
            offsets = caluclateXYOffsets(chrtLoc);
            transformText = 'translate('+ offsets.x +', '+ offsets.y +')';
            // define the path along the arc, and create the anchors for the text
            groups.dataLabelArc.selectAll('path')
                .data(data)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('id', function(d, i) {
                    return anchorText + i;
                })
                .style("opacity", 0.0) // needs to be edited after debugging
                .attr('transform', transformText);
                
            labelText = groups.dataLabelText.selectAll('text')
                .data(data)
                .enter()
                .append('text')      
                .attr("text-anchor", 'left')
                .attr('x', 5)
                .attr('dy', function (d,i) {
                    var innerRad = dataRadiusScale(i);
                    var outerRad = dataRadiusScale(i+1);
                    return ((outerRad - innerRad) * 65 / 100)  + 'px';  // a cludgy solution but seems to work to get the text in the middle of the arc
                });
                //.attr("vertical-align", 'text-bottom');
                
            labelText.append('textPath')
                .style('font-size', function (d,i) {
                    var innerRad = dataRadiusScale(i);
                    var outerRad = dataRadiusScale(i+1);
                    return Math.floor(((outerRad - innerRad) * 70 / 100)) + 'px';  // again cludgy for dynamic font size.  Changing this requires changing the dy parameter above.
                })
                .style("font-weight", 'bold')
                .style("font-family", 'Verdana')
                .attr("xlink:href", function(d, i) { return "#" + anchorText + i;}) 
                .text(function(d) {
                    return d.label;
                });
        }
        
        /**
         * 
         */
        function drawBigTics(bigTicsArc, groups, chrtLoc) {
            var offsets, transformText, bigTics;
            offsets = caluclateXYOffsets(chrtLoc);
            transformText = 'translate('+ offsets.x +', '+ offsets.y +')';
            bigTics = groups.bigTics.selectAll('path')
                .data(domainLabelValues.bigIncr)
                .enter()
                .append('path')
                .attr('d', bigTicsArc)
                .attr("stroke", '#595859')
                .attr("stroke-width", '.1')
                .attr("transform", transformText);
        }
        
        /**
         * 
         */
        function drawMiniTics(miniTicsArc, groups, chrtLoc) {
            var miniTics, offsets, bigTics, transformText;
            offsets = caluclateXYOffsets(chrtLoc);
            transformText = 'translate('+ offsets.x +', '+ offsets.y +')';
            bigTics = groups.miniTics.selectAll('path')
                .data(domainLabelValues.subIncr)
                .enter()
                .append('path')
                .attr('d', miniTicsArc)
                .attr("stroke", '#595859')
                .attr("stroke-width", '.1')
                .attr("transform", transformText);
        }
        
        function drawBigTicLabels(bigTicLabelsArc, groups, chrtLoc, anchorPrefix) {
            // define the path along which the text will go.
            var offsets, transformText;
            offsets = caluclateXYOffsets(chrtLoc);
            transformText = 'translate('+ offsets.x +', '+ offsets.y +')';

            groups.bigTicsLabelsPath.selectAll("path")
                .data(domainLabelValues.bigIncr)
                .enter()
                .append("path")
                .attr('d', bigTicLabelsArc)
                .attr("id", function(d,i) {
                    return anchorPrefix + '_scaleText' + i;
                })
                .style("opacity", 0.0)
                .attr("transform", transformText);
            
            var ticText = groups.bigTicsLabelsText.selectAll("text")
                .data(domainLabelValues.bigIncr)
                .enter()
                .append("text")
                .attr("x", '.8%'); // should be the full width of 10% of the full radius
                // .attr('dy', function (d,i) {
                    // var innerRad = dataRadiusScale(i);
                    // var outerRad = dataRadiusScale(i+1);
                    // return ((outerRad - innerRad) * 110 / 100)  + 'px';  // a cludgy solution but seems to work to get the text in the middle of the arc
                // });
                //.attr('class', 'shadow');
            
            // The gauge text needs to autoscale depending on the domain of the data.
            // 
            

            
            ticText.append("textPath")
                //.attr('text-anchor', 'middle')
                .style("font-size", '10px')
                .style("font-weight", 'bold')
                .style("font-family", 'Verdana')
                .attr("xlink:href", function(d, i) { return "#" + anchorPrefix + '_scaleText' + i;}) 
                .text(function(d) { return d ;}); //  return d / 10000;
        }
        
        function drawGaugeLabelText(gaugeLabelArc, groups, chrtLoc, config, unitData) {
            var offsets, transformText, gaugeUnits;
            offsets = caluclateXYOffsets(chrtLoc);
            transformText = 'translate('+ offsets.x +', '+ offsets.y +')';
            console.log("GaugeLabelTranslateString: " + transformText);
            //unitData = [config.label];
            
            groups.gaugeLabelPaths.selectAll("path")
                .data(unitData)
                .enter()
                .append("path")
                .attr('d', gaugeLabelArc)
                .attr("id", function(d,i) {
                    return config.anchorPrefix + 'unitText' + i;
                })
                .style("opacity", 0.0)
                .attr("transform", transformText);
                
            gaugeUnits = groups.gaugeUnitsText.selectAll("text")
                .data(unitData)
                .enter()
                .append("text");
                 //.attr('class', 'shadow');
            
            gaugeUnits.append("textPath")
                .attr('text-anchor', 'middle')
                .attr("startOffset", '25%')
                .style("font-size", '8px')
                .style("font-style", 'italic')
                .style("font-family", 'Verdana')
                .attr("xlink:href", function(d, i) { return "#" + config.anchorPrefix + 'unitText' + i;}) 
                .text(function(d) { return d });
        }
        
        function defineGroupedElements() {
            var groups = {};
            groups.dataArcs = svg.append('g');
            groups.textArc = svg.append('g');
            groups.dataLabelArc = svg.append('g');
            groups.dataLabelText = svg.append('g');
            groups.bigTics = svg.append('g');
            groups.bigTicsLabelsPath = svg.append('g');
            groups.bigTicsLabelsText = svg.append('g');
            groups.miniTics = svg.append('g');
            groups.gaugeLabelPaths = svg.append('g');
            groups.gaugeUnitsText = svg.append('g');
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
            var config = pieChrt.chartConfigs[dataPosition];
            var chrtLoc = chartsPositionalInfo[dataPosition];
            var groups = defineGroupedElements();
            
            objectToConsole(data);
            
            // drawing the data
            var dataArc = defineDataArc(data);
            drawDataArc(data, dataArc, groups.dataArcs, chrtLoc);
            
            // labelling the data
            var labelArc = defineLabelArc(data);
            drawLabelDataArc(data, labelArc, groups, chrtLoc, config.anchorPrefix);
            
            // Draw the big tics
            var bigTicsArc = defineBigTicksArc();
            drawBigTics(bigTicsArc, groups, chrtLoc);
            
            // Draw big tic labels
            var bigTicLabelsArc = defineBigTicksLabelsArc();
            drawBigTicLabels(bigTicLabelsArc, groups, chrtLoc, config.anchorPrefix);
            
            // Draw mini tics
            var miniTicsArc = defineMiniTicksArc();
            drawMiniTics(miniTicsArc, groups, chrtLoc);
            
            // Draw label
            var labelData = [config.label + ' (' + config.units + ')'];
            var gaugeLabelArc = defineGaugeLabelArc();
            drawGaugeLabelText(gaugeLabelArc, groups, chrtLoc, config, labelData);
        }
        
        function debug_drawCircles() {
            var dataset, circles;
            dataset = [ 5, 10, 15, 20, 25 ];
            console.log("drawing now");
            circles = svg.selectAll("circle")
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
            if ((typeof pieChrt.chartDataSets).toString() === 'undefined') {
                resetParams();
            }
            pieChrt.chartDataSets.push(inputData);
            pieChrt.chartConfigs.push(config);
        };
        
        pieChrt.reset = function() {
            resetParams();
        };
        
        /**
         * using the data that has been added to this object using the method addDataObj
         * Will generate a chart for each piece of information.
         * 
         * @param {number} Width - The width in pixels of the output svg
         * @param {string} div - The div tag that identifies where in the html doc
         *                       the svg should be inserted.
         */
        pieChrt.createCharts = function(div, w) {
            // width will be static, height will be dynamic depending on how many charts need to 
            // be drawn.  Will draw 2 charts per width for now.
            // create the svg that needs to be drawn
            // width is optional;
            var junkvar, i, divelem;
            divelem = document.getElementById(div);
            junkvar = divelem.getBoundingClientRect().width;
            console.log("junkvar", junkvar)

            if (typeof w === 'undefined') {
                w = d3.select('#' + div).style('width');
                w = w.replace(/[^\d.-]/g, '');
                w = parseInt(w);
            }
            console.log("w is" + w);
            svgParams.width = w;
            defineChartSize(svgParams.width);
            
            d3.select('#' + div).select('svg').remove();
            
            
            svg = d3.select('#' + div)
                .append("svg")
                .attr("width", svgParams.width)
                .attr("height", svgParams.height);
                
            console.log("svg width:" + svgParams.width);
            console.log("svg height:" + svgParams.height);
            console.log("charts")
            // Iterating over the data used to draw each chart.
            for (i=0; i<pieChrt.chartDataSets.length; i+=1) {
                configureScaleFunctions(i);
                drawChart(i);
            }
        };

        return pieChrt;
    }(pieChart || {}));
