let mainMap, alaskaMap, hawaiiMap;
let addresses = [];
let markers = {};
let southWest = L.latLng(5.49955, -170), // Approximate SW corner (adjust as needed)
  northEast = L.latLng(83.162102, -50), // Approximate NE corner (adjust as needed)
  bounds = L.latLngBounds(southWest, northEast);

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
    // attribution: "© OpenStreetMap contributors",
  }).addTo(mainMap);

  alaskaMap = L.map("alaska-inset", {
    attributionControl: false,
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
  }).setView([64.2008, -149.4937], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    // attribution: "© OpenStreetMap contributors",
  }).addTo(alaskaMap);

  hawaiiMap = L.map("hawaii-inset", {
    attributionControl: false,
    zoomControl: true,
    scrollWheelZoom: true,
    dragging: true,
  }).setView([20.7967, -156.3319], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    // attribution: "© OpenStreetMap contributors",
  }).addTo(hawaiiMap);
}

// Initialize app
async function init() {
  initMaps();
}

init();
