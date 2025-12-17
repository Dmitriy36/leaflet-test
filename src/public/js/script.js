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
let summaryQry = `Select Coalesce(Cast(VAMC as nVarchar(3)),'Total') as VAMC,
Sum(Case When Item='forks' Then Qty Else 0 End) as TotalForks,
Sum(Case When Item='spoons' Then Qty Else 0 End) as TotalSpoons
From [Inventory].[ForksSpoons]
Where VAMC IN ($1)
Group by rollup(VAMC)`;
let canLoadAll = false;
// const doneSound = new Audio("/audio/done.wav");
// const allDoneSound = new Audio("/audio/allDone.wav");
// Initialize maps
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

// async function GetAnalytics() {
//   fetch("/test")
//     .then((response) => response.json())
//     .then((data) => {
//       const popup = window.open("", "Results", "width=1000,height=1500");
//       popup.document.write(
//         `<html>
//         <head>
//         <title>Analytics Check</title>
//               <style>
//               body { font-family: 'Lucida Sans Unicode', 'Lucida Grande', sans-serif; font-size: 1em; }
//               table { border-collapse: collapse; width: 100%; }
//               th, td { border: 1px solid black; padding: 8px; text-align: left; }
//               th { background-color: #f2f2f2; }
//               </style>
//         </head>
//         <body>

//         <table border="1">
//                      <tr>
//                      <th>VAMC</th>
//                      <th>Forks</th>
//                      <th>Spoons</th>
//                      </tr>             ${data.data
//                        .map(
//                          (row) =>
//                            `<tr><td>${row.VAMC}</td><td>${row.TotalForks}</td>                 <td>${row.TotalSpoons}</td></tr>`
//                        )
//                        .join("")}
//        </table>
//        </body>
//        </html>     `
//       );
//     });
// }

async function GetAnalyticsPost() {
  // if selectedSites is not empty:
  if (selectedSites.length > 0) {
    vamcIds = selectedSites.map((site) => site.ExternalId);
  } else {
    vamcIds = allSites.map((site) => site.ExternalId);
  }

  console.log("these VAMC ids were sent: ", JSON.stringify(vamcIds));
  // Send to backend
  fetch("/test", {
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
              th { background-color: #f2f2f2; }       
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

function ClearAll() {
  canLoadAll = false;
  buttonsList.forEach((button) => {
    button.className = "sidebar-button";
  });
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
      let geoObj = { lat: site.Latitude, lng: site.Longitude };
      AddMarker(geoObj);
      DrawLine(geoObj);
    }, index * 25);
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
  allButton.disabled = true;
  if (selectedSites.length === 0) {
    alert("Please select at least one site, otherwise use Load All.");
  } else {
    selectedSites.forEach((site, index) => {
      setTimeout(() => {
        let geoObj = { lat: site.Latitude, lng: site.Longitude };
        AddMarker(geoObj);
        DrawLine(geoObj);
      }, index * 25);
    });
  }
}

async function AddLinesSelectedNoDelay() {
  let allButton = document.getElementById("loadallBtn");
  allButton.disabled = true;
  if (selectedSites.length === 0) {
    alert("Please select at least one site, otherwise use Load All.");
  } else {
    selectedSites.forEach((site) => {
      let geoObj = { lat: site.Latitude, lng: site.Longitude };
      AddMarker(geoObj);
      DrawLine(geoObj);
    });
  }
}

async function AddButtons() {
  const sites = await LoadSites();
  const container = document.getElementById("sidebar");
  container.innerHTML = "";

  sites.forEach((site) => {
    let button = document.createElement("button");
    button.classList.add("sidebar-button");
    button.textContent = site.ExternalId + " - " + site.FacilityName;
    button.id = `site-${site.ExternalId}-button`;
    button.siteObject = JSON.stringify(site); // experimentas - is it OK to attach objects like this?
    button.onclick = () => {
      selectedSites.push(site);
      button.className = "sidebar-button-selected";
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
