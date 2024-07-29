import { colorOne, colorTwo, colorFour, colorFive } from "../constants/colors.js";

function renderCAFVEligibilityByElectricRange(data) {
    const margin = { top: 10, right: 30, bottom: 80, left: 60 },
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#chart-cafv1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define the bins for electric range
    const electricRangeBins = [
        { label: "0-50 miles", filter: d => d["Electric Range"] <= 50 },
        { label: "50-100 miles", filter: d => d["Electric Range"] > 50 && d["Electric Range"] <= 100 },
        { label: "100-150 miles", filter: d => d["Electric Range"] > 100 && d["Electric Range"] <= 150 },
        { label: "150-200 miles", filter: d => d["Electric Range"] > 150 && d["Electric Range"] <= 200 },
        { label: "> 200 miles", filter: d => d["Electric Range"] > 200 }
    ];

    const eligibilityCounts = electricRangeBins.map(bin => {
        const filteredData = data.filter(bin.filter);
        const eligibleCount = filteredData.filter(d => d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Clean Alternative Fuel Vehicle Eligible").length;
        const ineligibleCount = filteredData.filter(d => d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Not eligible due to low battery range").length;
        const unresearchedCount = filteredData.filter(d => d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Eligibility unknown as battery range has not been researched").length;
        return { range: bin.label, eligible: eligibleCount, ineligible: ineligibleCount, unresearched: unresearchedCount };
    });

    const x = d3.scaleBand()
        .domain(eligibilityCounts.map(d => d.range))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(eligibilityCounts, d => d.eligible + d.ineligible + d.unresearched)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    const stack = d3.stack().keys(["eligible", "ineligible", "unresearched"]);
    const stackedData = stack(eligibilityCounts);

    const color = d3.scaleOrdinal()
        .domain(["eligible", "ineligible", "unresearched"])
        .range([colorFour, colorFive, "red"]);

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
        .attr("x", d => x(d.data.range))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());

    // Add legend
    const legendData = ["Eligible", "Ineligible", "Unresearched"];
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 120}, 0)`);

    legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d.toLowerCase()));

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 24)
        .attr("y", (d, i) => i * 20 + 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

    // Add a tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "#333")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    svg.selectAll("rect")
        .on("mouseover", function(event, d) {
            const total = d.data.eligible + d.data.ineligible + d.data.unresearched;
            const eligiblePercentage = ((d.data.eligible / total) * 100).toFixed(2);
            const ineligiblePercentage = ((d.data.ineligible / total) * 100).toFixed(2);
            const unresearchedPercentage = ((d.data.unresearched / total) * 100).toFixed(2);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Range: ${d.data.range}<br/>Count: ${total}<br/>Eligible: ${eligiblePercentage}%<br/>Ineligible: ${ineligiblePercentage}%<br/><span style="color: red; font-weight: bold;">Cars assigned 0 value in dataset due to battery range not researched: ${unresearchedPercentage}%</span>`)
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

function renderCAFVEligibilityByModelYear(data) {
    const margin = { top: 10, right: 30, bottom: 80, left: 60 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#chart-cafv2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const modelYearCounts = d3.rollup(data,
      v => ({
        eligible: v.filter(d => d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Clean Alternative Fuel Vehicle Eligible").length,
        ineligible: v.filter(d => d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Not eligible due to low battery range").length,
        unresearched: v.filter(d => d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Eligibility unknown as battery range has not been researched").length
      }),
      d => d["Model Year"]
    );

    const sortedModelYears = Array.from(modelYearCounts, ([key, value]) => ({
      year: key,
      eligible: value.eligible,
      ineligible: value.ineligible,
      unresearched: value.unresearched
    })).sort((a, b) => d3.ascending(a.year, b.year));

    const x = d3.scaleBand()
      .domain(sortedModelYears.map(d => d.year))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedModelYears, d => d.eligible + d.ineligible + d.unresearched)])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(d3.axisLeft(y));

    const stack = d3.stack().keys(["eligible", "ineligible", "unresearched"]);
    const stackedData = stack(sortedModelYears);

    const color = d3.scaleOrdinal()
      .domain(["eligible", "ineligible", "unresearched"])
      .range([colorFour, colorFive, "red"]); // Adding red for unresearched eligibility

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
      .attr("x", d => x(d.data.year))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());

    // Add legend
    const legendData = ["Eligible", "Ineligible", "Unresearched"];
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 400}, 0)`);

    legend.selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => color(d.toLowerCase().replace(" ", "_")));

    legend.selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", 24)
      .attr("y", (d, i) => i * 20 + 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => d);

    // Add a tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "#333")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("color", "white")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    svg.selectAll("rect")
      .on("mouseover", function(event, d) {
        const total = d.data.eligible + d.data.ineligible + d.data.unresearched;
        const eligiblePercentage = ((d.data.eligible / total) * 100).toFixed(2);
        const ineligiblePercentage = ((d.data.ineligible / total) * 100).toFixed(2);
        const unresearchedPercentage = ((d.data.unresearched / total) * 100).toFixed(2);
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`Model Year: ${d.data.year}<br/>Count: ${total}<br/>Eligible: ${eligiblePercentage}%<br/>Ineligible: ${ineligiblePercentage}%<br/><span style="color: red; font-weight: bold;">Cars assigned 0 value in dataset due to battery range not researched: ${unresearchedPercentage}%</span>`)
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

  function renderTopUnresearchedCarMakes(data) {
    const margin = { top: 10, right: 30, bottom: 80, left: 60 },
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#chart-cafv3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Filter data for unresearched cars
    const unresearchedData = data.filter(d => d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Eligibility unknown as battery range has not been researched");

    // Group by car make and count BEVs and PHEVs
    const carMakeCounts = d3.rollup(unresearchedData,
        v => ({
            total: v.length,
            bev: v.filter(d => d["Electric Vehicle Type"] === "Battery Electric Vehicle (BEV)").length,
            phev: v.filter(d => d["Electric Vehicle Type"] === "Plug-in Hybrid Electric Vehicle (PHEV)").length
        }),
        d => d.Make
    );

    // Convert to array and sort by count descending, then get top 10
    const topCarMakes = Array.from(carMakeCounts, ([key, value]) => ({
        Make: key,
        Total: value.total,
        BEV: value.bev,
        PHEV: value.phev
    }))
        .sort((a, b) => d3.descending(a.Total, b.Total))
        .slice(0, 10);

    const x = d3.scaleBand()
        .domain(topCarMakes.map(d => d.Make))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(topCarMakes, d => d.Total)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("rect")
        .data(topCarMakes)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Make))
        .attr("y", d => y(d.Total))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.Total))
        .attr("fill", "red");

    // Add a tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "#333")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    svg.selectAll("rect")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Make: ${d.Make}<br/>Total: ${d.Total}<br/>BEV: ${d.BEV}<br/>PHEV: ${d.PHEV}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}


function renderUnresearchedCarsByModelYear(data) {
    const margin = { top: 10, right: 30, bottom: 80, left: 60 },
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#chart-cafv4")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Get current year
    const currentYear = new Date().getFullYear();
    const last15Years = d3.range(currentYear - 15, currentYear + 1);

    // Filter data for unresearched cars and last 15 years
    const unresearchedData = data.filter(d =>
        d["Clean Alternative Fuel Vehicle (CAFV) Eligibility"] === "Eligibility unknown as battery range has not been researched" &&
        last15Years.includes(+d["Model Year"])
    );

    // Group by model year and count BEV and PHEV
    const modelYearCounts = d3.rollup(unresearchedData,
        v => ({
            BEV: v.filter(d => d["Electric Vehicle Type"] === "Battery Electric Vehicle (BEV)").length,
            PHEV: v.filter(d => d["Electric Vehicle Type"] === "Plug-in Hybrid Electric Vehicle (PHEV)").length
        }),
        d => d["Model Year"]
    );

    // Convert to array and sort by year ascending
    const sortedModelYears = Array.from(modelYearCounts, ([key, value]) => ({
        year: key,
        BEV: value.BEV,
        PHEV: value.PHEV
    })).sort((a, b) => d3.ascending(a.year, b.year));

    const x = d3.scaleBand()
        .domain(sortedModelYears.map(d => d.year))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sortedModelYears, d => d.BEV + d.PHEV)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    const stack = d3.stack().keys(["BEV", "PHEV"]);
    const stackedData = stack(sortedModelYears);

    const color = d3.scaleOrdinal()
        .domain(["BEV", "PHEV"])
        .range([colorOne, colorTwo]);

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
        .attr("x", d => x(d.data.year))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth());

    // Add legend
    const legendData = ["Battery Electric Vehicle (BEV)", "Plug-in Hybrid Electric Vehicle (PHEV)"];
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 400}, 0)`);

    legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d));

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 24)
        .attr("y", (d, i) => i * 20 + 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

    // Add a tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "#333")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    svg.selectAll("rect")
        .on("mouseover", function(event, d) {
            const total = d.data.BEV + d.data.PHEV;
            const BEVCount = d.data.BEV;
            const PHEVCount = d.data.PHEV;
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Model Year: ${d.data.year}<br/>Total: ${total}<br/>BEV: ${BEVCount}<br/>PHEV: ${PHEVCount}`)
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

export { renderCAFVEligibilityByElectricRange, renderCAFVEligibilityByModelYear, renderTopUnresearchedCarMakes, renderUnresearchedCarsByModelYear };

