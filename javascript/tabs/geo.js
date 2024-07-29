import { colorOne, colorTwo } from "../constants/colors.js";

function renderEVDistributionByCounty(data) {
    const width = 500;
    const height = 300;

    // Create a tooltip div that is hidden by default
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "#333")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")  // Set text color to white
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Load map and data
    d3.json("../geojson/wa_county_map.geojson").then(function (countyData) {
      const projection = d3.geoConicEqualArea()
        .parallels([47, 49]) // Adjust these parallels to match Washington State
        .rotate([120, 0]) // Rotate to center on Washington State
        .fitSize([width, height], countyData);

      const path = d3.geoPath().projection(projection);

      const svg = d3.select("#chart-geo1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      svg.append("g")
        .selectAll("path")
        .data(countyData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
          const countyName = d.properties.NAME; // Assuming the county name is in 'properties.NAME'
          const countyCount = data.filter(e => e.County === countyName).length;
          return d3.interpolateBlues(countyCount / 1000); // Adjust denominator as needed for better color scaling
        })
        .attr("stroke", "#333")
        .on("mouseover", function(event, d) {
          const countyName = d.properties.NAME;
          const countyCount = data.filter(e => e.County === countyName).length;
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(`${countyName}<br/>EV Count: ${countyCount}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
          tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });

      svg.append("g")
        .selectAll("text")
        .data(countyData.features)
        .enter()
        .append("text")
        .attr("x", d => path.centroid(d)[0])
        .attr("y", d => path.centroid(d)[1])
        .attr("dy", ".35em")
        .text(d => d.properties.NAME)
        .attr("font-size", "10px")
        .attr("fill", "#FF0000");  // Set text color to red for better contrast
    });
  }

function renderEVDistributionByCity(data) {
    // Calculate counts for BEV and PHEV by city
    const cityTypeCounts = d3.rollup(data,
      v => ({
        BEV: v.filter(d => d["Electric Vehicle Type"] === "Battery Electric Vehicle (BEV)").length,
        PHEV: v.filter(d => d["Electric Vehicle Type"] === "Plug-in Hybrid Electric Vehicle (PHEV)").length
      }),
      d => d.City
    );

    // Sort cities by total count of EVs and get top 10 cities
    const sortedCities = Array.from(cityTypeCounts, ([key, value]) => ({
      City: key,
      BEV: value.BEV,
      PHEV: value.PHEV,
      Total: value.BEV + value.PHEV
    }))
    .sort((a, b) => d3.descending(a.Total, b.Total))
    .slice(0, 10);

    const margin = { top: 10, right: 30, bottom: 80, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    // Clear any existing SVG
    d3.select("#chart-geo2").selectAll("*").remove();

    const svg = d3.select("#chart-geo2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 60) // Additional space for legend
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(sortedCities.map(d => d.City))
      .padding(0.2);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedCities, d => d.Total)])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y));

    // Stack the data
    const stackedData = d3.stack()
      .keys(["BEV", "PHEV"])
      (sortedCities);

    // Create the stacked bars
    const color = d3.scaleOrdinal()
      .domain(["Battery Electric Vehicle (BEV)", "Plug-in Hybrid Electric Vehicle (PHEV)"])
      .range([colorOne, colorTwo]);

    // Create a tooltip div that is hidden by default
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "#333")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")  // Set text color to white
      .style("font-size", "12px")
      .style("pointer-events", "none");

    svg.selectAll("g.layer")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => x(d.data.City))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .attr("stroke", "black")
      .on("mouseover", function(event, d) {
        const cityName = d.data.City;
        const BEVCount = d.data.BEV;
        const PHEVCount = d.data.PHEV;
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${cityName}<br/>BEV Count: ${BEVCount}<br/>PHEV Count: ${PHEVCount}`)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add legend below the chart
    const legendData = ["Plug-in Hybrid Electric Vehicle (PHEV)", "Battery Electric Vehicle (BEV)"];

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(0, ${height + 50})`); // Position below the chart with extra padding

    legend.selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20) // Stacked vertically
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => color(d));

    legend.selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", 25)
      .attr("y", (d, i) => i * 20 + 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => d);
  }

  export { renderEVDistributionByCounty, renderEVDistributionByCity };