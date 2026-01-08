let mainMap, alaskaMap, hawaiiMap;
let allSites = [];
let selectedSites = [];
let buttonsList = [];
let addresses = [];
let markerGroupMain, markerGroupAlaska, markerGroupHawaii;
let southWest = L.latLng(5.49955, -170), // Approximate SW corner
  northEast = L.latLng(83.162102, -50), // Approximate NE corner
  bounds = L.latLngBounds(southWest, northEast);
let myPolylines = [];
let vamcIds = [];
const container = document.getElementById("sidebar");
let canLoadAll = false;

function initMaps() {
  mainMap = L.map("main-map", {
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    attributionControl: false,
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([39.8283, -98.5795], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    bounds: bounds,
  }).addTo(mainMap);

  alaskaMap = L.map("alaska-inset", {
    attributionControl: false,
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
  }).setView([64.2008, -149.4937], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
    alaskaMap
  );

  hawaiiMap = L.map("hawaii-inset", {
    attributionControl: false,
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
  }).setView([20.7967, -156.3319], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
    hawaiiMap
  );

  mainMap.on("zoomend moveend viewreset", function () {
    ClearMarkers();
    ClearLines();

    if (selectedSites.length === 0 && canLoadAll) {
      AddLinesAllNoDelay();
    } else {
      AddLinesSelectedNoDelay();
    }
  });

  markerGroupMain = L.layerGroup().addTo(mainMap);
  markerGroupHawaii = L.layerGroup().addTo(hawaiiMap);
  markerGroupAlaska = L.layerGroup().addTo(alaskaMap);
}

async function LoadSites() {
  const response = await fetch("/api/sites");
  allSites = await response.json();
  allSites.sort((a, b) => a.ExternalId - b.ExternalId);
  return allSites;
}

async function LoadByRegion(regionNumber) {
  ClearAll();
  fetch("/byregion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ region: regionNumber }),
  })
    .then((response) => response.json())
    .then((results) => {
      const IDs = results.data;
      // alert(JSON.stringify(IDs));
      selectedSites = IDs;
      AddLinesSelected();
    })
    .catch((error) => console.error("Error: ", error));
}

async function LoadByVISN(VISNNumber) {
  ClearAll();
  fetch("/byvisn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ visn: VISNNumber }),
  })
    .then((response) => response.json())
    .then((results) => {
      const IDs = results.data;
      // alert(JSON.stringify(IDs));
      selectedSites = IDs;
      AddLinesSelected();
    })
    .catch((error) => console.error("Error: ", error));
}

// function AnalyticsMenu() {
//   const width = 500;
//   const height = 200;
//   const left = window.screenX + (window.outerWidth - width) / 2;
//   const top = window.screenY + (window.outerHeight - height) / 2;
//   const popup = window.open(
//     "",
//     "Analytics",
//     `width=${width},height=${height},left=${left},top=${top}`
//   );

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>Analytics</title>
//       <style>
//         .button-container {
//           display: flex;
//           justify-content: center;
//           gap: 20px;
//           margin-top: 25px;
//         }
// button {
//   font-size: x-large;
//   font-weight: bold;
//   font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
//     "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
// }
//       </style>
//     </head>
//     <body>
//       <div class="button-container">
//         <button style="font-size:25px;" onclick="window.opener.CallGetCPAReportNoInner()">APAR Analytics</button>
//         <button style="font-size:25px;" onclick="alert('Analytics-2 clicked')">APAT Analytics</button>
//       </div>
//     </body>
//     </html>
//   `;

//   popup.document.write(html);
//   popup.document.close(); // Close the document stream
// }

function AnalyticsMenu() {
  const width = 1000;
  const height = 300;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  window.open(
    "/analytics-menu.html",
    "Analytics",
    `width=${width},height=${height},left=${left},top=${top}`
  );
}

function HandleReport(dropdownId) {
  const selectedValue = document.getElementById(dropdownId).value;
  switch (selectedValue) {
    case "apar1":
      window.opener.CallGetCPAReportNoInner();
      break;
    case "apar2":
      alert("define APAR report first.");
      break;
    case "apar3":
      alert("define APAR report first.");
      break;
    case "apar4":
      alert("define APAR report first.");
      break;
    case "apat1":
      alert("define APAT report first.");
      break;
    case "apat2":
      alert("define APAT report first.");
      break;
    case "apat3":
      alert("define APAT report first.");
      break;
    case "apat4":
      alert("define APAT report first.");
      break;
  }
}

async function GetAnalyticsPost() {
  // if selectedSites is not empty:
  if (selectedSites.length > 0) {
    vamcIds = selectedSites.map((site) => site.ExternalId);
  } else {
    vamcIds = allSites.map((site) => site.ExternalId);
  }

  console.log("these VAMC ids were sent: ", JSON.stringify(vamcIds));
  // Send to backend
  fetch("/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vamcIds: vamcIds }),
  })
    .then((response) => response.json())
    .then((data) => {
      const popup = window.open("", "Results", "width=1000,height=1500");
      popup.document.write(
        `<html>        
        <head>
        <title>Analytics Check</title>
              <style>        
              body { font-family: 'Lucida Sans Unicode', 'Lucida Grande', sans-serif; font-size: 1em; }        
              table { border-collapse: collapse; width: 100%; }        
              th, td { border: 1px solid black; padding: 8px; text-align: left; }        
              th { background-color: #17d1a3ff; position: sticky; top: 0;}      
              </style>
        </head>        
        <body>          
                 
        <table border="1">
                     <tr>              
                     <th>VAMC</th>              
                     <th>Forks</th>              
                     <th>Spoons</th>            
                     </tr>
                     ${data.data
                       .map(
                         (row) =>
                           `<tr><td>${row.VAMC}</td><td>${row.TotalForks}</td>                 <td>${row.TotalSpoons}</td></tr>`
                       )
                       .join("")}          
       </table>        
       </body>      
       </html>`
      );
    });
}

function CallGetCPAReport() {
  GetCPAReport().catch((err) => console.error(err));
}

function CallGetCPAReportNoInner() {
  GetCPAReportNoInner().catch((err) => console.error(err));
}

async function GetCPAReport() {
  // if selectedSites is not empty:
  if (selectedSites.length > 0) {
    vamcIds = selectedSites.map((site) => site.ExternalId);
  } else {
    vamcIds = allSites.map((site) => site.ExternalId);
  }

  console.log("these VAMC ids were sent: ", JSON.stringify(vamcIds));

  // Send to backend
  fetch("/financial-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vamcIds: vamcIds }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Received data:", data);
      console.log("data.data:", data.data);

      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error("Invalid data structure:", data);
        alert("Error: No data returned - check console");
        return;
      }

      const popup = window.open(
        "",
        "Control Point Activity Report",
        "width=1400,height=800"
      );

      // ADD THIS CHECK
      if (!popup) {
        alert("Popup was blocked. Please allow popups for this site.");
        return;
      }

      // Helper function to format currency
      const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || amount === 0)
          return "$0.00";
        return (
          "$" +
          parseFloat(amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      };

      popup.document.write(
        `<html>      
        <head>
        <title>Control Point Activity</title>
              <style>      
              body { font-family: 'Lucida Sans Unicode', 'Lucida Grande', sans-serif; font-size: 0.5em; }      
              table { border-collapse: collapse; width: 100%; }      
              th, td { border: 1px solid black; padding: 8px; text-align: left; }      
              th { background-color: #17d1a3ff; position: sticky; top: 0;}
              td.currency { text-align: right; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              .null-value { color: #999; font-style: italic; }
              </style>
        </head>      
        <body>        
                 
        <table border="1">
                     <tr>            
                     <th>VAMC ID</th>            
                     <th>Date</th>            
                     <th>Department</th>
                     <th>Vendor</th>
                     <th>Account</th>
                     <th>Contract #</th>
                     <th>Requestor</th>
                     <th>Approver</th>
                     <th>Committed Estimated Cost</th>
                     <th>Transaction Amount</th>          
                     </tr>
                   
${data.data
  .map(
    (row) =>
      `<tr>
        <td>${row.station_number || '<span class="null-value">N/A</span>'}</td>
        <td>${
          row.date_of_request
            ? new Date(row.date_of_request).toLocaleDateString("en-US")
            : '<span class="null-value">N/A</span>'
        }</td>
        <td>${
          row.requesting_service || '<span class="null-value">N/A</span>'
        }</td>
        <td>${row.vendor || '<span class="null-value">N/A</span>'}</td>
        <td>${row.cost_center || '<span class="null-value">N/A</span>'}</td>
        <td>${
          row.purchase_order_obligation_no ||
          '<span class="null-value">N/A</span>'
        }</td>
        <td>${
          row.originator_of_request || '<span class="null-value">N/A</span>'
        }</td>
        <td>${
          row.approving_official || '<span class="null-value">N/A</span>'
        }</td>
        <td class="currency">${formatCurrency(
          row.Committed_Estimated_Cost
        )}</td>
        <td class="currency">${formatCurrency(row.Transaction_Amount)}</td>
      </tr>`
  )
  .join("")}
   
       </table>      
       </body>    
       </html>`
      );

      popup.document.close(); // Close the document stream
    })
    .catch((error) => {
      console.error("Error fetching financial report:", error);
      alert("Error loading financial report. Please try again.");
    });
}

async function GetCPAReportNoInner() {
  // if selectedSites is not empty:
  if (selectedSites.length > 0) {
    vamcIds = selectedSites.map((site) => site.ExternalId);
  } else {
    vamcIds = allSites.map((site) => site.ExternalId);
  }

  console.log("these VAMC ids were sent: ", JSON.stringify(vamcIds));

  // Send to backend
  fetch("/financial-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vamcIds: vamcIds }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Received data:", data);
      console.log("data.data:", data.data);

      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error("Invalid data structure:", data);
        alert("Error: No data returned - check console");
        return;
      }

      // Store data in sessionStorage so the popup can access it
      sessionStorage.setItem("financialReportData", JSON.stringify(data.data));

      // Open the popup to a dedicated HTML page
      const popup = window.open(
        "/financial-report.html",
        "Control Point Activity Report",
        "width=1400,height=800"
      );

      if (!popup) {
        alert("Popup was blocked. Please allow popups for this site.");
        return;
      }
    })
    .catch((error) => {
      console.error("Error fetching financial report:", error);
      alert("Error loading financial report. Please try again.");
    });
}

function ClearAll() {
  canLoadAll = false;
  UnHighlightAllButtons();
  selectedSites.length = 0;
  ReenableAllButtons();
  ClearMarkers();
  ClearLines();
}

function ReenableAllButtons() {
  let button1 = document.getElementById("clearallBtn");
  let button2 = document.getElementById("loadallBtn");
  let button3 = document.getElementById("loadselectedBtn");

  button1.disabled = false;
  button2.disabled = false;
  button3.disabled = false;
}

function ClearLines() {
  // lines
  myPolylines.forEach(function (polyline) {
    mainMap.removeLayer(polyline);
  });
}

function ClearMarkers() {
  // markers
  markerGroupMain.clearLayers();
  markerGroupAlaska.clearLayers();
  markerGroupHawaii.clearLayers();
}

function AddMarker(geo) {
  if (geo.lng > -149) {
    L.circleMarker([geo.lat, geo.lng], {
      // let circleMarker =
      weight: 2,
      radius: 3,
      color: "green",
      fillColor: "rgba(217, 255, 0, 1)",
      fillOpacity: 0.5,
    }).addTo(markerGroupMain);
  } else {
    L.circleMarker([geo.lat, geo.lng], {
      weight: 2,
      radius: 3,
      color: "green",
      fillColor: "rgba(217, 255, 0, 1)",
      fillOpacity: 0.5,
    }).addTo(markerGroupHawaii);
    L.circleMarker([geo.lat, geo.lng], {
      weight: 2,
      radius: 3,
      color: "green",
      fillColor: "rgba(217, 255, 0, 1)",
      fillOpacity: 0.5,
    }).addTo(markerGroupAlaska);
  }
}

function DrawLine(geo) {
  let markerLatLng = geo;
  let myDiv = document.getElementById("db-symbol");
  let divRect = myDiv.getBoundingClientRect();

  let mapContainerRect = mainMap.getContainer().getBoundingClientRect();
  let divCenterX = divRect.left + divRect.width / 2 - mapContainerRect.left;
  let divCenterY = divRect.top + divRect.height / 2 - mapContainerRect.top;

  let divLatLng = mainMap.containerPointToLatLng([divCenterX, divCenterY]);

  let polylinePoints = [markerLatLng, divLatLng];
  let myPolyline = L.polyline(polylinePoints, {
    color: "blue",
    weight: 1,
  }).addTo(mainMap);
  myPolylines.push(myPolyline);
}

async function AddLinesAll() {
  canLoadAll = true;
  let selectedButton = document.getElementById("loadselectedBtn");
  selectedButton.disabled = true;
  allSites.forEach((site, index) => {
    setTimeout(() => {
      let currentVAMCbutton = document.getElementById(
        `site-${site.ExternalId}-button`
      );
      HighlightButton(currentVAMCbutton);
      let geoObj = { lat: site.Latitude, lng: site.Longitude };
      AddMarker(geoObj);
      DrawLine(geoObj);
    }, index * 25);
  });
}

function HighlightButton(button) {
  button.className = "sidebar-button-selected";
}

function UnHighlightAllButtons() {
  buttonsList.forEach((button) => {
    button.className = "sidebar-button";
  });
}

async function AddLinesAllNoDelay() {
  allSites.forEach((site) => {
    let geoObj = { lat: site.Latitude, lng: site.Longitude };
    AddMarker(geoObj);
    DrawLine(geoObj);
  });
}

async function AddLinesSelected() {
  let allButton = document.getElementById("loadallBtn");
  if (selectedSites.length === 0) {
    alert("please select some sites...");
  } else {
    UnHighlightAllButtons();
    allButton.disabled = true;
    selectedSites.forEach((site, index) => {
      setTimeout(() => {
        let currentVAMCbutton = document.getElementById(
          `site-${site.ExternalId}-button`
        );
        HighlightButton(currentVAMCbutton);
        let geoObj = { lat: site.Latitude, lng: site.Longitude };
        AddMarker(geoObj);
        DrawLine(geoObj);
      }, index * 25);
    });
  }
}

async function SelectByVISN() {
  // pass VISN number to script.js
}

async function SelectByRegion() {
  // pass Region number to script.js
}

async function AddLinesSelectedNoDelay() {
  let allButton = document.getElementById("loadallBtn");
  allButton.disabled = true;

  selectedSites.forEach((site) => {
    let geoObj = { lat: site.Latitude, lng: site.Longitude };
    AddMarker(geoObj);
    DrawLine(geoObj);
  });
}

async function AddButtons() {
  const sites = await LoadSites();
  container.innerHTML = "";

  sites.forEach((site) => {
    let button = document.createElement("button");
    button.classList.add("sidebar-button");
    button.textContent = site.ExternalId + " - " + site.FacilityName;
    button.id = `site-${site.ExternalId}-button`;
    button.siteObject = JSON.stringify(site);
    button.onclick = () => {
      selectedSites.push(site);
      // button.className = "sidebar-button-selected";
      HighlightButton(button);
    };
    button.oncontextmenu = () => {
      event.preventDefault();
      const newSelectedSites = selectedSites.filter(
        (item) => item.ExternalId !== site.ExternalId
      );
      selectedSites = newSelectedSites;
      button.className = "sidebar-button";
      ClearLines();
      ClearMarkers();
      AddLinesSelectedNoDelay();
      // alert("right click detected on button " + button.id);
    };

    container.appendChild(button);
    buttonsList.push(button);
  });
}

function PrintSelected() {
  selectedSites.forEach((thing) => {
    console.log(thing);
  });
}

AddButtons();
// addLines();

// Initialize app
async function init() {
  initMaps();
}

init();
