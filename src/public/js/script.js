let mainMap, alaskaMap, hawaiiMap;
let allSites = [];
let selectedSites = [];
let addresses = [];
let markerGroup;
let southWest = L.latLng(5.49955, -170), // Approximate SW corner
  northEast = L.latLng(83.162102, -50), // Approximate NE corner
  bounds = L.latLngBounds(southWest, northEast);
let myPolylines = [];

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

  markerGroup = L.layerGroup().addTo(mainMap);

  mainMap.on("zoomend moveend", function () {
    ClearMarkers();
    ClearLines();
    addLinesNoDelay();
  });

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
}

async function loadSites() {
  const response = await fetch("/api/sites");
  allSites = await response.json();
  allSites.sort((a, b) => a.ExternalId - b.ExternalId);
  return allSites;
}

function buttonSelect() {
  // change button color
  // add to selectedSites
}

function clearSelected() {
  // reset button color
  // clear selectedSites
}

function loadAll() {}

function loadSelected() {}

function ClearLines() {
  // lines
  myPolylines.forEach(function (polyline) {
    mainMap.removeLayer(polyline);
  });
}

function ClearMarkers() {
  // markers
  markerGroup.clearLayers();
}

function AddMarker(geo) {
  let circleMarker = L.circleMarker([geo.lat, geo.lng], {
    weight: 2,
    radius: 7,
    color: "green",
    fillColor: "#f03",
    fillOpacity: 0.5,
  }).addTo(markerGroup);
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

async function addLines() {
  allSites.forEach((site, index) => {
    setTimeout(() => {
      let geoObj = { lat: site.Latitude, lng: site.Longitude };
      AddMarker(geoObj);
      DrawLine(geoObj);
    }, index * 25);
  });
}

async function addLinesNoDelay() {
  allSites.forEach((site, index) => {
    let geoObj = { lat: site.Latitude, lng: site.Longitude };
    AddMarker(geoObj);
    DrawLine(geoObj);
  });
}

async function addButtons() {
  const sites = await loadSites();

  const container = document.getElementById("sidebar");
  container.innerHTML = "";

  sites.forEach((site) => {
    const button = document.createElement("button");
    button.textContent = site.ExternalId + " - " + site.FacilityName;
    button.id = `site-${site.ExternalId}-button`;
    button.siteObject = JSON.stringify(site); // experimentas - is it OK to attach objects like this?
    button.onclick = () => {
      // alert(`You clicked ${site.FacilityName}`);
      alert(`You clicked ${button.siteObject}`);
    };
    container.appendChild(button);
  });
  addLines();
}

addButtons();
addLines();

// Initialize app
async function init() {
  initMaps();
}

init();
