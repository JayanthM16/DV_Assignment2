// Function to load and process CSV data
function loadCSV() {
    d3.csv("data_sample.csv").then(function(data) {
        data.forEach(d => {
            d["Estimated Cost"] = +d["EstimatedCost"];
            d["Raw Material"] = +d["RawMaterial"];
            d["Workmanship"] = +d["Workmanship"];
            d["Storage Cost"] = +d["StorageCost"];
            
            // Calculate ActualCost, SoldPrice, and MarginOfProfit
            d["Actual Cost"] = d["Raw Material"] + d["Workmanship"] + d["Storage Cost"];
            d["Sold Price"] = d["Estimated Cost"] * 1.1;
            d["Margin of Profit"] = d["Sold Price"] - d["Actual Cost"];

            // Convert Date
            d["Date"] = d3.timeParse("%m/%d/%y")(d["date"]);
        });

        console.log("Processed Data:", data); // Debugging

        // Display Table
        displayTable(data);

        // Display D3 Chart
        displayChart(data);
    }).catch(error => console.error("Error loading CSV:", error));
}

// Function to display table
function displayTable(data) {
    let table = `<table>
        <tr>
            <th>Date</th>
            <th>Estimated Cost ($)</th>
            <th>Raw Material ($)</th>
            <th>Workmanship ($)</th>
            <th>Storage ($)</th>
            <th>Actual Cost ($)</th>
            <th>Sold Price ($)</th>
            <th>Margin of Profit ($)</th>
        </tr>`;

    data.forEach(entry => {
        table += `<tr>
            <td>${d3.timeFormat("%Y-%m-%d")(entry.Date)}</td>
            <td>${entry["Estimated Cost"].toFixed(2)}</td>
            <td>${entry["Raw Material"].toFixed(2)}</td>
            <td>${entry["Workmanship"].toFixed(2)}</td>
            <td>${entry["Storage Cost"].toFixed(2)}</td>
            <td>${entry["Actual Cost"].toFixed(2)}</td>
            <td>${entry["Sold Price"].toFixed(2)}</td>
            <td style="color:${entry["Margin of Profit"] < 0 ? 'red' : 'black'};">
                ${entry["Margin of Profit"].toFixed(2)}
            </td>
        </tr>`;
    });

    table += `</table>`;
    document.getElementById("output").innerHTML = table;
}

// Function to display D3.js Multi-line Chart
function displayChart(data) {
    const svg = d3.select("#chart"),
          width = 1000, height = 800,
          margin = { top: 50, right: 150, bottom: 60, left: 100 };

    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width - margin.left - margin.right]);

    const y = d3.scaleLinear()
        .domain([
            Math.min(0, d3.min(data, d => d["Margin of Profit"])), // Ensure 0 is included for negative values
            d3.max(data, d => d["Sold Price"])
        ])
        .nice()
        .range([height - margin.top - margin.bottom, 0]);

    // Manually set the colors
    const colorScale = {
        "Estimated Cost": "#a6cee3",
        "Actual Cost": "#1f78b4",
        "Sold Price": "#b2df8a",
        "Margin of Profit": "#33a02c"
    };

    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.value));

    const linesData = [
        { name: "Estimated Cost", values: data.map(d => ({ Date: d.Date, value: d["Estimated Cost"] })) },
        { name: "Actual Cost", values: data.map(d => ({ Date: d.Date, value: d["Actual Cost"] })) },
        { name: "Sold Price", values: data.map(d => ({ Date: d.Date, value: d["Sold Price"] })) },
        { name: "Margin of Profit", values: data.map(d => ({ Date: d.Date, value: d["Margin of Profit"] })) }
    ];

    g.selectAll(".line")
        .data(linesData)
        .enter().append("path")
        .attr("fill", "none")
        .attr("stroke", d => colorScale[d.name])
        .attr("stroke-width", 3)
        .attr("d", d => line(d.values));

    // X-Axis
    g.append("g")
        .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));

    // Y-Axis
    g.append("g").call(d3.axisLeft(y));

    // Legend
    const legend = g.selectAll(".legend")
        .data(linesData)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(${width - 250}, ${i * 30})`);

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 10)
        .attr("fill", d => colorScale[d.name]);

    legend.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .text(d => d.name);
}

window.onload = loadCSV;
