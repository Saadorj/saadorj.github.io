import { renderIntroChart } from './tabs/intro.js';
import { renderEVDistributionByCounty, renderEVDistributionByCity } from './tabs/geo.js';
import { renderElectricRangeByCarMakerSortedByCount, renderElectricRangeByCarMakerSortedByMileage } from './tabs/spec.js';
import { renderCAFVEligibilityByModelYear, renderCAFVEligibilityByElectricRange, renderTopUnresearchedCarMakes, renderUnresearchedCarsByModelYear} from './tabs/cafv.js';

// Tab navigation
const tabs = document.querySelectorAll('.nav-tabs div');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    contents[index].classList.add('active');
    if (index === 1) { // If the Geographic Distribution tab is selected
      renderGeoCharts();
    }
    else if (index === 2) { // If the Vehicle Specifications tab is selected
      renderSpecCharts();
    }
    else if (index === 3) { // If the Clean Alternative Fuel Vehicle Eligibility tab is selected
      renderCAFVCharts();
    }
  });
});

d3.csv("data/ev_population_data_wa.csv").then(function (data) {
  renderIntroChart(data);
  populateCountyDropdown(data);
  window.evData = data; // Store data in global variable for later use
});

function populateCountyDropdown(data) {
  const countyCounts = d3.rollup(data, v => v.length, d => d.County);
  const sortedCounties = Array.from(countyCounts, ([key, value]) => ({ County: key, Count: value }))
    .sort((a, b) => d3.descending(a.Count, b.Count))
    .slice(0, 5);

  const countySelect = d3.select("#countySelect");

  countySelect.selectAll("option")
    .data(sortedCounties)
    .enter()
    .append("option")
    .attr("value", d => d.County)
    .text(d => d.County);

  countySelect.on("change", function() {
    const selectedCounty = this.value;
    if (selectedCounty === "all") {
      renderIntroChart(data);
    } else {
      const filteredData = data.filter(d => d.County === selectedCounty);
      renderIntroChart(filteredData, selectedCounty);
    }
  });
}

function renderGeoCharts() {
  const data = window.evData;

  // Clear previous charts
  d3.select("#chart-geo1").selectAll("*").remove();
  d3.select("#chart-geo2").selectAll("*").remove();

  renderEVDistributionByCounty(data);
  renderEVDistributionByCity(data);
}


function renderSpecCharts() {
  const data = window.evData;
  // Clear previous charts
  d3.select("#chart-spec1").selectAll("*").remove();
  d3.select("#chart-spec2").selectAll("*").remove();

  renderElectricRangeByCarMakerSortedByCount(data);
  renderElectricRangeByCarMakerSortedByMileage(data);
  }

  function renderCAFVCharts() {
    const data = window.evData;

    // Clear previous charts
    d3.select("#chart-cafv1").selectAll("*").remove();
    d3.select("#chart-cafv2").selectAll("*").remove();
    d3.select("#chart-cafv3").selectAll("*").remove();
    d3.select("#chart-cafv4").selectAll("*").remove();

    renderCAFVEligibilityByElectricRange(data);
    renderCAFVEligibilityByModelYear(data);
    renderTopUnresearchedCarMakes(data);
    renderUnresearchedCarsByModelYear(data);
  }

