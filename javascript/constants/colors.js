// Chart colors
const colorOne = "#ffc107";
const colorTwo = "#a56eff";
const colorThree = "#fa4d56";
const colorFour = "#3ddbd9";
const colorFive = "#012749";

const evTypeColor = d3.scaleOrdinal()
  .domain(["Battery Electric Vehicle (BEV)", "Plug-in Hybrid Electric Vehicle (PHEV)"])
  .range([colorOne, colorTwo]);

export { evTypeColor, colorOne, colorTwo, colorThree, colorFour, colorFive };