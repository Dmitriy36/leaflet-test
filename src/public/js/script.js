let mainMap, alaskaMap, hawaiiMap;
let addresses = [];
let markers = {};
let southWest = L.latLng(5.49955, -170), // Approximate SW corner (adjust as needed)
  northEast = L.latLng(83.162102, -50), // Approximate NE corner (adjust as needed)
  bounds = L.latLngBounds(southWest, northEast);
let myPolylines = [];
let VAMClist = [
  {
    STA3N: 703,
    Name: "Northeast Vet Center",
    Address: "609 Lowell Ave, Lowell NC 28098",
    Geo: L.latLng(35.26633, -81.092299),
  },
  {
    STA3N: 704,
    Name: "Northwest Vet Center",
    Address: "300 W. 10th · Topeka, KS 66612",
    Geo: L.latLng(39.047962, -95.677975),
  },
];

fetch("/api/users")
  .then((response) => response.json())
  .then((users) => console.log(users));
// have an array for "selected"

fetch("api/forks")
  .then((response) => response.json())
  .then((thing) => console.log(thing))


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

  renderThings();

  mainMap.on("zoomend moveend", function () {
    myPolylines.forEach(function (polyline) {
      mainMap.removeLayer(polyline);
    });
    // alert("zoomed!");
    renderThings();
  });

  function renderThings() {
    DrawLine(VAMClist[0].Geo);
    DrawLine(VAMClist[1].Geo);
  }

  function DrawLine(geo) {
    let markerLatLng = geo;
    let myDiv = document.getElementById("db-symbol");
    let divRect = myDiv.getBoundingClientRect();

    let mapContainerRect = mainMap.getContainer().getBoundingClientRect();
    let divCenterX = divRect.left + divRect.width / 2 - mapContainerRect.left;
    let divCenterY = divRect.top + divRect.height / 2 - mapContainerRect.top;

    let divLatLng = mainMap.containerPointToLatLng([divCenterX, divCenterY]);

    let marker = L.marker(geo).addTo(mainMap);

    let polylinePoints = [markerLatLng, divLatLng];
    let myPolyline = L.polyline(polylinePoints, {
      color: "blue",
      weight: 1,
    }).addTo(mainMap);
    myPolylines.push(myPolyline);
  }

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
