// Get the samples.json endpoint
const url = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';

// Create a promise for the samples data
const samplesPromise = d3.json(url);

// Fetch the JSON data and console log it
samplesPromise.then(function (data) {
  console.log("Fetched data:", data); // Log the fetched data to the console

  const names = data.names;
  console.log("Names:", names); // Log the names to the console

  // Populate dropdown with names
  const dropdown = d3.select("#selDataset");
  names.forEach(name => {
    dropdown.append("option").attr("value", name).text(name);
  });

  // Initial render
  optionChanged(names[0]);
});

// Function to update charts based on selected individual
function optionChanged(selectedName) {
  // Use the resolved promise data
  samplesPromise.then(function (data) {
    console.log("Selected data:", data); // Log the selected data to the console

    // Update the bar chart
    updateBarChart(selectedName, data);

    // Update the bubble chart
    updateBubbleChart(selectedName, data);

    // Display sample metadata
    displaySampleMetadata(selectedName, data);

    // Update the gauge chart
    updateGaugeChart(selectedName, data);
  });
}

// Event listener for dropdown change
d3.select("#selDataset").on("change", function () {
  const selectedName = d3.select("#selDataset").property("value");
  optionChanged(selectedName);
});

// Function to update the bar chart based on the selected individual
function updateBarChart(selectedName, data) {
  // Find the selected sample
  const selectedSample = data.samples.find(sample => sample.id === selectedName);

  // Extract top 10 OTUs data
  const top10Values = selectedSample.sample_values.slice(0, 10).reverse();
  const top10Labels = selectedSample.otu_ids.slice(0, 10).map(id => `OTU ${id}`).reverse();
  const top10HoverText = selectedSample.otu_labels.slice(0, 10);

  // Create a trace for the bar chart
  const barTrace = {
    x: top10Values,
    y: top10Labels,
    text: top10HoverText,
    type: "bar",
    orientation: "h"
  };

  // Create a layout for the bar chart
  const barLayout = {
    title: {
      text: `<b>Top 10 OTUs for ${selectedName}</b>`,
      font: { size: 14 }, // Adjust the font size as needed
      x: 0.45, // Set x to 0.5 for centering horizontally
      y: 0.85 // Adjust y as needed for vertical positioning
    },
    xaxis: { title: "Sample Values" },
    yaxis: { title: "OTU IDs" }
  };

  // Plot the bar chart
  Plotly.newPlot("bar", [barTrace], barLayout);
}

// Function to update the bubble chart based on the selected individual
function updateBubbleChart(selectedName, data) {
  // Find the selected sample
  const selectedSample = data.samples.find(sample => sample.id === selectedName);

  // Extract data for bubble chart
  const bubbleValues = selectedSample.sample_values;
  const bubbleLabels = selectedSample.otu_ids;
  const bubbleText = selectedSample.otu_labels;

  // Create a trace for the bubble chart
  const bubbleTrace = {
    x: bubbleLabels,
    y: bubbleValues,
    text: bubbleText,
    mode: 'markers',
    marker: {
      size: bubbleValues,
      color: bubbleLabels,
      colorscale: 'Earth',
      opacity: 0.7
    }
  };

  // Create a layout for the bubble chart
  const bubbleLayout = {
    margin: { t: 20, l: 50, r: 50, b: 50 },
    xaxis: {
      title: "OTU IDs",
      tickmode: "linear",
      tick0: 0,
      dtick: 500
    },
    yaxis: {
      title: "Sample Values",
      tickmode: "linear",
      tick0: 0,
      dtick: 50,
      range: [0, Math.max(...bubbleValues) + 50] // Set the range for the y-axis
    }
  };

  // Plot the bubble chart
  Plotly.newPlot("bubble", [bubbleTrace], bubbleLayout);
}

// Function to display sample metadata
function displaySampleMetadata(selectedName, data) {
  // Find the selected sample metadata
  const selectedMetadata = data.metadata.find(sample => sample.id === +selectedName);

  // Select the panel-body div
  const panelBody = d3.select("#sample-metadata");

  // Clear existing metadata
  panelBody.html("");

  // Display each key-value pair from the metadata JSON object
  Object.entries(selectedMetadata).forEach(([key, value]) => {
    panelBody.append("p").text(`${key}: ${value}`);
  });
}

// Function to update gauge chart based on selected individual
function updateGaugeChart(selectedName, data) {
  // Find the selected sample's metadata
  const selectedMetadata = data.metadata.find(sample => sample.id === +selectedName);

  // Check if metadata is available
  if (selectedMetadata) {
    // Extract washing frequency data
    const washingFrequency = selectedMetadata.wfreq;
    console.log("Washing frequency:", washingFrequency); // Log the washing frequency to the console

    // Define gradient colors for the gauge steps (brighter colors)
    const gradientColors = [
      "#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800",
      "#FF5722", "#E91E63", "#9C27B0", "#3F51B5"
    ];

    // Create a trace for the gauge chart
    const gaugeTrace = {
      domain: { x: [0, 1], y: [0, 1] },
      value: washingFrequency,
      title: {
        text: "<b>Belly Button Washing Frequency<br><span style='color: blue;'>Scrubs per Week</span></b>",
        font: { size: 18 }
      },
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: { range: [null, 9], tickmode: "linear" },
        bar: { color: "black" },
        steps: gradientColors.map((color, index) => ({
          range: [index, index + 1],
          color: color
        })),
        threshold: {
          line: { color: "red", width: 4 },
          thickness: 0.75,
          value: washingFrequency
        }
      }
    };
    console.log("Gauge chart trace:", gaugeTrace); // Log the gauge chart trace to the console

    // Create a layout for the gauge chart
    const gaugeLayout = {
      width: 600,
      height: 500,
      margin: { t: 0, b: 0 },
    };
    console.log("Gauge chart layout:", gaugeLayout); // Log the gauge chart layout to the console

    // Plot the gauge chart
    Plotly.newPlot("gauge", [gaugeTrace], gaugeLayout);
  } else {
    console.warn(`Metadata not found for sample ${selectedName}`);
  }
}
