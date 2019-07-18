request = new XMLHttpRequest();
request.open(
  "GET",
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
  true
);
request.send();
request.onload = () => {
  json = JSON.parse(request.responseText);

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
    [2.8, "#0000c4"],
    [3.9, "#3332c8"],
    [5.0, "#6563cc"],
    [6.1, "#9895d0"],
    [7.2, "#cac6d3"],
    [8.3, "#fdf8d7"],
    [9.5, "#f0c6ac"],
    [10.6, "#e39581"],
    [11.7, "#d66356"],
    [12.8, "#c9322b"],
    [12.9, "#bc0000"]
  ];

  const getColor = temp => {
    let color = "";
    if (temp < 2.8) {
      color = colorScale[0][1];
    } else if (temp < 3.9) {
      color = colorScale[1][1];
    } else if (temp < 5.0) {
      color = colorScale[2][1];
    } else if (temp < 6.1) {
      color = colorScale[3][1];
    } else if (temp < 7.2) {
      color = colorScale[4][1];
    } else if (temp < 8.3) {
      color = colorScale[5][1];
    } else if (temp < 9.5) {
      color = colorScale[6][1];
    } else if (temp < 10.6) {
      color = colorScale[7][1];
    } else if (temp < 11.7) {
      color = colorScale[8][1];
    } else if (temp < 12.8) {
      color = colorScale[9][1];
    } else {
      color = colorScale[10][1];
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
    .attr("height", h + margin + margin + margin)
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

  // add legend color boxes
  svg
    // .select("main")
    .selectAll("legendKey")
    .data("colorScale")
    .enter()
    .append("rect")
    .attr("x", (d, i) => {
      return i * 40;
    })
    .attr("y", h + 40)
    .attr("width", 40)
    .attr("height", 40)
    .style("fill", (d, i) => colorScale[i][1])
    .style("stroke", "black");

  // add legend lines under color box
  svg
    .selectAll("legendLine")
    .data(colorScale)
    .enter()
    .append("line")
    .attr("x1", (d, i) => i * 40)
    .attr("x2", (d, i) => i * 40)
    .attr("y1", h + 80)
    .attr("y2", h + 90)
    .style("stroke", (d, i) =>
      i === 0 || i === colorScale.length - 1 ? "white" : "black"
    );

  // add temp values to legend
  svg
    .selectAll("legendValues")
    .data(colorScale)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 40 - 10)
    .attr("y", h + 105)
    .text((d, i) =>
      i === 0 || i === colorScale.length - 1 ? "" : colorScale[i][0]
    );

  // Define the div for the tooltip
  let toolTip = d3
    .select("main")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // add the rectangles
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
