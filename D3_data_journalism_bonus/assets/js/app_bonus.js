// Homework Bonus: Data Journalism and D3
// Reference: 16-D3-12 activity
//= ================================

// Set up chart
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 80
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the group by left and top margins.
// ==================================================
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append a SVG group 
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initialize params
// ===================================
// Create functions relating to X-Axis
// ===================================

var chosenXAxis = "poverty";//initialize

// create function used to update x-scale variable upon clicking on x axis chosen label
function xScale(censusData, chosenXAxis) {
    // create x linear scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.75,
                 d3.max(censusData, d => d[chosenXAxis]) * 1.25])
        .range([0, width]); 
    return xLinearScale;
}
// create function used to render X-Axis upon clicking on x axis chosen label
function renderXAxis(newXScale, xAxis) {
    
  var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// ===================================
// Create functions relating to Y-Axis
// ===================================
var chosenYAxis = "healthcare";//initialize

// created function used to update y-scale variable upon clicking on y axis chosen label
function yScale(censusData, chosenYAxis) {
    //create y linear scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.75,
                 d3.max(censusData, d => d[chosenYAxis]) * 1.25])
        .range([height, 0]);
    return yLinearScale;
}

// create functions used to render y-Axis upon clicking on y axis label
function renderYAxis(newYScale, yAxis) {
    
  var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// create function to highlight and update text upon clicking on the chosen axis
function renderText(textgroup, newXScale, chosenXAxis, newYScale, chosenYAxis){

  textgroup.transition()
  .duration(1000)
  .attr("x", d => newXScale(d[chosenXAxis]))
  .attr("y", d => newYScale(d[chosenYAxis]));

  return textgroup;
}

// create function used for updating circles group with a transition to
// new circles based on chosenXAxis or/and chosenYAxis
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

//*********************************************************************
// create function used for updating circles group with new tooltip
//*********************************************************************
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // if select x Label, having 3 choices
    var xLabel;
  
    if (chosenXAxis === "poverty"){
        xLabel = "In Poverty (%) :";
    }
    else if (chosenXAxis === "income"){
        xLabel = "Household Income (Median) :";
    }
    else {
        xLabel = "Age (Median) :";
    }
  
    // if select y Label, having 3 choices
    var yLabel;

    if (chosenYAxis === "healthcare"){
        yLabel = "Lacks Healthcare (%) :";
    }
    else if (chosenYAxis === "smokes"){
        yLabel = "Smokes (%) :";
    }
    else{
        yLabel = "Obese (%) :";
    }

     var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([10,-10])
      // .style("left", d3.event.pageX + "px")
      // .style("top", d3.event.pageY + "px")
      .html(function(d) {
        return (`<strong>${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip);
  
      // on mouseover event
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);}) // add ", this" from just toolTip.show(data) initially

      // on mouseout event
                .on("mouseout", function(data, index) {
                toolTip.hide(data);});
  
    return circlesGroup;
  }

// Get data from the provided csv data file (2014 ACS estimates from US Census Bureau)

d3.csv("assets/data/data.csv").then(function(censusData){
    console.log(censusData);

    // Parse and format to number
    censusData.forEach(function(data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // set up x, y linear scales 
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // set up bottom and left axises 
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // initial x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // initial y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // initial circles
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

    // create groups for x, y axes lables
    //== x Lable Group ==
    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
    .classed("aText", true);
    
  
    var povertyXLabel = xLabelsGroup.append("text")
    .attr("value", "poverty") // value to grab for event listener
    .attr("x",0)
    .attr("y",0)
    .classed("active", true)
    .text("In Poverty (%)");

    var incomeXLabel = xLabelsGroup.append("text")
    .attr("value", "income") // value to grab for event listener
    .attr("x",0)
    .attr("y",20)
    .classed("inactive", true)
    .text("Household Income (Median)");

    var ageXLabel = xLabelsGroup.append("text")
    .attr("value", "age") // value to grab for event listener
    .attr("x",0)
    .attr("y",40)
    .classed("inactive", true)
    .text("Age (Median)");

    //== y Lable Group ==
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left/2}, ${(height/2)})`)
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em")
    // .attr("text-anchor","middle")
    .classed("aText", true);

    var healthcareYLabel = yLabelsGroup.append("text")
    .attr("value", "healthcare") // value to grab for event listener
    .attr("x", 0 - 200)
    .attr("y", 0 - 30)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    var smokesYLabel = yLabelsGroup.append("text")
    .attr("value", "smokes") // value to grab for event listener
    .attr("x", 0 - 200)
    .attr("y", 0 - 50)
    .classed("inactive", true)
    .text("Smokes (%)");

    var obesityYLabel = yLabelsGroup.append("text")
    .attr("value", "obesity") // value to grab for event listener
    .attr("x", 0 - 200)
    .attr("y", 0 - 70)
    .classed("inactive", true)
    .text("Obese (%)");
          

  //update ToolTip function with data
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  //=========================================
  //x axis labels event listener
  //=========================================
    xLabelsGroup.selectAll("text")
    .on("click", function() {
        //get value of selection
        var value = d3.select(this).attr("value");

        //check if value is same as current axis
        if (value != chosenXAxis) {

            //replace chosenXAxis with value
            chosenXAxis = value;

            console.log(chosenXAxis);
            console.log(chosenYAxis);

            //update x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            //update x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            //update circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update state abbr text with new x values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //change classes to change bold text
            if (chosenXAxis === "poverty") {
              povertyXLabel.classed("active", true).classed("inactive", false);
              incomeXLabel.classed("active", false).classed("inactive", true);
              ageXLabel.classed("active", false).classed("inactive", true);
            } else if (chosenXAxis === "income") {
                    povertyXLabel.classed("active", false).classed("inactive", true);
                    incomeXLabel.classed("active", true).classed("inactive", false);
                    ageXLabel.classed("active", false).classed("inactive", true);
            } else {
                    povertyXLabel.classed("active", false).classed("inactive", true);
                    incomeXLabel.classed("active", false).classed("inactive", true);
                    ageXLabel.classed("active", true).classed("inactive", false);
            }
        }
      });
    //=========================================
    //y axis labels event listener
    //=========================================
      yLabelsGroup.selectAll("text")
      .on("click", function() {
          //get value of selection
          var value = d3.select(this).attr("value");

          //check if value is same as current axis
          if (value != chosenYAxis) {

              //replace chosenYAxis with value
              chosenYAxis = value;

              //update y scale for new data
              yLinearScale = yScale(censusData, chosenYAxis);

              //update x axis with transition
              yAxis = renderYAxis(yLinearScale, yAxis);

              //update circles with new y values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

              //update text with new y values
              textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

              //update tooltips with new info
              circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

              //change classes to change bold text
              if (chosenYAxis === "obesity") {
                  obesityYLabel.classed("active", true).classed("inactive", false);
                  smokesYLabel.classed("active", false).classed("inactive", true);
                  healthcareYLabel.classed("active", false).classed("inactive", true);
              } else if (chosenYAxis === "smokes") {
                  obesityYLabel.classed("active", false).classed("inactive", true);
                  smokesYLabel.classed("active", true).classed("inactive", false);
                  healthcareYLabel.classed("active", false).classed("inactive", true);
              } else {
                  obesityYLabel.classed("active", false).classed("inactive", true);
                  smokesYLabel.classed("active", false).classed("inactive", true);
                  healthcareYLabel.classed("active", true).classed("inactive", false);
              }
          }
      });
}).catch(function(error) {
    console.log(error);
  });