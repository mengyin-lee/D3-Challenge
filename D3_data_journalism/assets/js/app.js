// Homework: Data Journalism and D3
// Utilizing 16-D3-03 class activities code snippets
// Step 1: Set up chart
//= ================================
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 40
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,

// =================================
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append an SVG group that will hold our chart,
// and shift the group by left and top margins.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Step 3: Get data from the provided csv data file (2014 ACS estimates from US Census Bureau)

d3.csv("assets/data/data.csv").then(function(censusData){
    console.log(censusData);

    // Step 4: Parse and format to number
    censusData.forEach(function(data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // Step 5: Initialize params

    // chose healthcare vs poverty for charting
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    var max = d3.max(censusData, d => d[chosenYAxis]);
    console.log(max)

    // set up x, y linear scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.75,
                 d3.max(censusData, d => d[chosenXAxis]) * 1.25])
        .range([0, width]);
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.75,
                 d3.max(censusData, d => d[chosenYAxis]) * 1.25])
        .range([height, 0]);

    // set up bottom and left axises 
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 14)
        .attr("opacity", "5.0");

    // state abbreviation text
    var textGroup = chartGroup.selectAll(".stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3)
        .attr("font-size", "11px")
        .text(function(d) { return d.abbr });

    // x, y axes lables: poverty vs healthcare
    var povertyLabel = chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
    .attr("class", "axisText")
    .style("text-anchor", "middle")
    .text("In Poverty (%)");

    var healthcareLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left - 5)
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lacks Healthcare (%)");
          
}).catch(function(error) {
    console.log(error);
  });