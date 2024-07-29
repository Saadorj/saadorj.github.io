import { colorSix } from '../constants/colors.js';

function renderElectricRangeByCarMakerSortedByCount(data) {
    const margin = { top: 10, right: 30, bottom: 80, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#chart-spec1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Group data by Make and calculate the average electric range and counts for BEV and PHEV
    const avgRangeByMake = d3.rollup(data,
      v => ({
        AvgRange: d3.mean(v, d => +d["Electric Range"]),
        BEVCount: v.filter(d => d["Electric Vehicle Type"] === "Battery Electric Vehicle (BEV)").length,
        PHEVCount: v.filter(d => d["Electric Vehicle Type"] === "Plug-in Hybrid Electric Vehicle (PHEV)").length,
        UnknownEligibilityCount: v.filter(d => d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Eligibility unknown as battery range has not been researched").length,
        TotalCount: v.length
      }),
      d => d["Make"]
    );

    // Filter out makes with fewer than 1000 cars and get the top 15 by TotalCount
    const filteredData = Array.from(avgRangeByMake, ([key, value]) => ({
      Make: key,
      AvgRange: value.AvgRange,
      BEVCount: value.BEVCount,
      PHEVCount: value.PHEVCount,
      UnknownEligibilityCount: value.UnknownEligibilityCount,
      TotalCount: value.TotalCount
    }))
      .filter(d => d.TotalCount > 1000)
      .sort((a, b) => d3.descending(a.TotalCount, b.TotalCount))
      .slice(0, 15);

    const x = d3.scaleBand()
      .domain(filteredData.map(d => d.Make))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.AvgRange)])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${d} miles`));

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

    // Create the bars
    svg.selectAll("rect")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Make))
      .attr("y", d => y(d.AvgRange))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.AvgRange))
      .attr("fill", colorSix)
      .attr("stroke", "black")
      .on("mouseover", function(event, d) {
        const bevPercentage = ((d.BEVCount / d.TotalCount) * 100).toFixed(2);
        const phevPercentage = ((d.PHEVCount / d.TotalCount) * 100).toFixed(2);
        const unknownEligibilityPercentage = ((d.UnknownEligibilityCount / d.TotalCount) * 100).toFixed(2);
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${d.Make}<br/>Average Range: ${d.AvgRange.toFixed(2)} miles<br/>Car Count: ${d.TotalCount}<br/>BEV: ${bevPercentage}%<br/>PHEV: ${phevPercentage}%<br/><span style="color: red; font-weight: bold;">Car % assigned 0 battery range due to lack of research: ${unknownEligibilityPercentage}%</span>`)
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

  // Add annotation note to the chart
  svg.append("rect")
    .attr("x", width - 260)  // Adjust this value based on your preference for positioning
    .attr("y", -margin.top + 10)
    .attr("width", 250)
    .attr("height", 40)
    .attr("fill", "lightgrey")
    .attr("stroke", "red")
    .attr("rx", 5)
    .attr("ry", 5);

  svg.append("text")
    .attr("x", width - 130)  // Adjust this value based on your preference for positioning
    .attr("y", -margin.top + 25)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .style("fill", "red")
    .text("Note: Vehicles with a zero electric range")
    .append("tspan")
    .attr("x", width - 130)
    .attr("dy", "1.2em")
    .text("have not had their battery range researched");
  }

  function renderElectricRangeByCarMakerSortedByMileage(data) {
    const margin = { top: 10, right: 30, bottom: 80, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#chart-spec2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Group data by Make and calculate the average electric range and counts for BEV and PHEV
    const avgRangeByMake = d3.rollup(data,
      v => ({
        AvgRange: d3.mean(v, d => +d["Electric Range"]),
        BEVCount: v.filter(d => d["Electric Vehicle Type"] === "Battery Electric Vehicle (BEV)").length,
        PHEVCount: v.filter(d => d["Electric Vehicle Type"] === "Plug-in Hybrid Electric Vehicle (PHEV)").length,
        TotalCount: v.length
      }),
      d => d["Make"]
    );

    // Filter out makes with fewer than 1000 cars
    const filteredData = Array.from(avgRangeByMake, ([key, value]) => ({
      Make: key,
      AvgRange: value.AvgRange,
      BEVCount: value.BEVCount,
      PHEVCount: value.PHEVCount,
      TotalCount: value.TotalCount
    }))
      .filter(d => d.TotalCount > 1000)
      .sort((a, b) => d3.descending(a.AvgRange, b.AvgRange))
      .slice(0, 15);

    const x = d3.scaleBand()
      .domain(filteredData.map(d => d.Make))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.AvgRange)])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${d} miles`));

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

    // Create the bars
    svg.selectAll("rect")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Make))
      .attr("y", d => y(d.AvgRange))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.AvgRange))
      .attr("fill", colorSix)
      .attr("stroke", "black")
      .on("mouseover", function(event, d) {
        const bevPercentage = ((d.BEVCount / d.TotalCount) * 100).toFixed(2);
        const phevPercentage = ((d.PHEVCount / d.TotalCount) * 100).toFixed(2);
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${d.Make}<br/>Average Range: ${d.AvgRange.toFixed(2)} miles<br/>Car Count: ${d.TotalCount}<br/>BEV: ${bevPercentage}%<br/>PHEV: ${phevPercentage}%`)
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
  }

  export { renderElectricRangeByCarMakerSortedByCount, renderElectricRangeByCarMakerSortedByMileage }