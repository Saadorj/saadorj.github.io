import { evTypeColor } from '../constants/colors.js';

export function renderIntroChart(data, selectedCounty = "all") {
    d3.select("#chart-intro1").selectAll("*").remove();
    d3.select("#legend").selectAll("*").remove();

    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom,
      radius = Math.min(width, height) / 2 - margin.top;

    var svg = d3.select("#chart-intro1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, ${(height + margin.top + margin.bottom) / 2})`);

    var pie = d3.pie()
      .value(d => d.Count);

    var arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var label = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    var tooltip = d3.select("#chart-intro1")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip");

    var mouseover = function(event, d) {
      tooltip.style("opacity", 1);
    };

    var mousemove = function(event, d) {
      var total = d3.sum(evTypeData.map(d => d.Count));
      var percentage = ((d.data.Count / total) * 100).toFixed(2);
      tooltip
        .html(d.data.EVType + ":<br/>County: " + selectedCounty + "<br/>Count: " + d.data.Count + "<br/>Percentage: " + percentage + "%")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
    };

    var mouseleave = function(event, d) {
      tooltip.style("opacity", 0);
    };

    var evTypeCounts = d3.rollup(data, v => v.length, d => d["Electric Vehicle Type"]);
    var evTypeData = Array.from(evTypeCounts, ([key, value]) => ({ EVType: key, Count: value }));

    var arcs = pie(evTypeData);

    svg.selectAll("arc")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => evTypeColor(d.data.EVType))
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    var legend = d3.select("#legend")
      .append("div")
      .attr("class", "legend");

    legend.selectAll(".legend-item")
      .data(evTypeData)
      .enter()
      .append("div")
      .attr("class", "legend-item")
      .each(function(d) {
        d3.select(this)
          .append("div")
          .attr("class", "legend-color")
          .style("background-color", evTypeColor(d.EVType));

        d3.select(this)
          .append("div")
          .text(d.EVType);
      });
  }