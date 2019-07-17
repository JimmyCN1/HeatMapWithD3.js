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

  const baseTemp = json.baseTemperature;
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

  const colorScale = [
    "#0000c4",
    "#3332c8",
    "#6563cc",
    "#9895d0",
    "#cac6d3",
    "#fdf8d7",
    "#f0c6ac",
    "#e39581",
    "#d66356",
    "#c9322b",
    "#bc0000"
  ];

  const getColor = temp => {
    let color = "";
    if (temp < 2.8) {
      color = colorScale[0];
    } else if (temp < 3.9) {
      color = colorScale[1];
    } else if (temp < 5.0) {
      color = colorScale[2];
    } else if (temp < 6.1) {
      color = colorScale[3];
    } else if (temp < 7.2) {
      color = colorScale[4];
    } else if (temp < 8.3) {
      color = colorScale[5];
    } else if (temp < 9.5) {
      color = colorScale[6];
    } else if (temp < 10.6) {
      color = colorScale[7];
    } else if (temp < 11.7) {
      color = colorScale[8];
    } else if (temp < 12.8) {
      color = colorScale[9];
    } else {
      color = colorScale[10];
    }
    return color;
  };

  // define x and y scales
  const xScale = d3
    .scaleTime()
    .domain([d3.min(data, d => d.parsedYear), d3.max(data, d => d.parsedYear)])
    .range([0, w]);

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
    .attr("rx", 1)
    .attr("ry", 1)
    .attr("width", w / (d3.max(data, d => d.year) - d3.min(data, d => d.year)))
    .attr("height", h / 12)
    .style("fill", d => getColor(baseTemp + d.variance))
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 1.0)
    // define tooltip on mouseover
    .on("mouseover", () => {
      toolTip
        .transition()
        .duration(200)
        .style("opacity", 0.8);
    })
    .on("mousemove", d => {
      const { year, parsedMonth, variance } = d;
      toolTip
        .html(
          `${year} - ${parsedMonth}<br>${(
            Math.round((baseTemp + variance) * 10) / 10
          ).toFixed(1)}℃<br>${(Math.round(variance * 10) / 10).toFixed(1)}℃`
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
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
