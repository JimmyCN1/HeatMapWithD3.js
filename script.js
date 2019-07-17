request = new XMLHttpRequest();
request.open(
  "GET",
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
  true
);
request.send();
request.onload = () => {
  json = JSON.parse(request.responseText);

  console.log(json);

  const margin = 80;
  const w = 1000;
  const h = 450;

  const parseYear = d3.timeParse("%Y");
  const parseMonth = d3.timeParse("%m");
  const formatMonth = d3.timeFormat("%B");

  // format the data
  json.monthlyVariance.forEach(function(d, i) {
    d.parsedYear = parseYear(d.year);
    d.parsedMonth = formatMonth(parseMonth(d.month));
  });

  const data = json.monthlyVariance;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  // define x and y scales
  const xScale = d3
    .scaleTime()
    .domain([d3.min(data, d => d.parsedYear), d3.max(data, d => d.parsedYear)])
    .range([0, w]);

  // const yScale = d3
  //   .scaleOrdinal()
  //   .domain(months)
  //   .range(
  //     months.map((month, index) => {
  //       return h - (h / months.length) * index;
  //     })
  //   );

  const yScale = d3
    .scaleBand()
    .domain(months)
    .range([h, 0]);

  // define svg plot area
  let svg = d3
    .select("main")
    .append("svg")
    .attr("width", w + margin + margin)
    .attr("height", h + margin + margin)
    .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

  // add x-axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${h})`)
    .call(d3.axisBottom(xScale));

  // add y-axis
  svg.append("g").call(d3.axisLeft(yScale));

  // add y-axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin - 5)
    .attr("x", 0 - h / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Month");

  // Define the div for the tooltip
  let toolTip = d3
    .select("main")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // // Three function that change the tooltip when user hover / move / leave a cell
  // var mouseover = function(d) {
  //   tooltip.style("opacity", 1);
  //   d3.select(this)
  //     .style("stroke", "black")
  //     .style("opacity", 1);
  // };
  // var mousemove = function(d) {
  //   tooltip
  //     .html("The exact value of<br>this cell is: " + d.value)
  //     .style("left", d3.mouse(this)[0] + 70 + "px")
  //     .style("top", d3.mouse(this)[1] + "px");
  // };
  // var mouseleave = function(d) {
  //   tooltip.style("opacity", 0);
  //   d3.select(this)
  //     .style("stroke", "none")
  //     .style("opacity", 0.8);
  // };

  // add the squares
  svg
    .selectAll("rect")
    .data(data, function(d) {
      return d.parsedYear + ":" + d.parsedMonth;
    })
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return xScale(d.parsedYear);
    })
    .attr("y", function(d) {
      return yScale(d.parsedMonth);
    })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", w / (d3.max(data, d => d.year) - d3.min(data, d => d.year)))
    .attr("height", h / 12)
    // .style("fill", function(d) {
    //   return myColor(d.value);
    // })
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
    // define tooltip on mouseover
    .on("mouseover", d => {
      const { Time, Year, Name, Nationality, Doping } = d;
      toolTip
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      toolTip
        .html(
          `${Name}: ${Nationality}<br>Year: ${Year}, Time: ${Time}<br><br>${Doping}`
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", d => {
      toolTip
        .transition()
        .duration(500)
        .style("opacity", 0);
    });

  // // Handmade legend
  // svg
  //   .append("rect")
  //   .attr("x", w - 210)
  //   .attr("y", 89)
  //   .attr("width", 20)
  //   .attr("height", 20)
  //   .style("fill", "blue");
  // svg
  //   .append("rect")
  //   .attr("x", w - 210)
  //   .attr("y", 114)
  //   .attr("width", 20)
  //   .attr("height", 20)
  //   .style("fill", "orange");
  // svg
  //   .append("text")
  //   .attr("x", w - 185)
  //   .attr("y", 100)
  //   .text("Riders with Doping Allegations")
  //   .style("font-size", "15px")
  //   .attr("alignment-baseline", "middle");
  // svg
  //   .append("text")
  //   .attr("x", w - 185)
  //   .attr("y", 125)
  //   .text("No Doping Allegations")
  //   .style("font-size", "15px")
  //   .attr("alignment-baseline", "middle");

  // add the plot title
  svg
    .append("text")
    .attr("x", w / 2)
    .attr("y", 0 - margin / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "30px")
    .text("Monthly Global Land-Surface Temperature");
  svg
    .append("text")
    .attr("x", w / 2)
    .attr("y", 0 - margin / 2 + 26)
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .text("1753 - 2015: base temperature 8.66℃");
};
