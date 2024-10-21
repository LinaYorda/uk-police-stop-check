const monthUrls = {
    "2024-08": "data/data_2024-08.csv",
    "2024-07": "data/data_2024-07.csv",
    "2024-06": "data/data_2024-06.csv",
    "2024-05": "data/data_2024-05.csv",
    "2024-04": "data/data_2024-04.csv",
    "2024-03": "data/data_2024-03.csv",
    "2024-02": "data/data_2024-02.csv",
    "2024-01": "data/data_2024-01.csv"
};

// Define the custom police station icon


let markersLayer = null;
let map = null;  // Global map variable
let clusteredLayer = null; // For Clustered map
let heatLayer = null; // For Heatmap
let polygonLayer = null; // For GIS analysis polygons

// Static police station data
const policeData = {
    "elements": [
        { "lat": 51.5265494, "lon": -0.1440082, "tags": { "name": "Albany Street Police Station" }},
        { "lat": 51.5024485, "lon": -0.1108039, "tags": { "name": "British Transport Police" }},
        { "lat": 51.5277108, "lon": -0.1345656, "tags": { "name": "British Transport Police" }},
        { "lat": 51.4807695, "lon": -0.1634490, "tags": { "name": "Park Police" }},
        { "lat": 51.5202001, "lon": -0.0950784, "tags": { "name": "City of London Police" }},
        { "lat": 51.5178898, "lon": -0.0811740, "tags": { "name": "Transport Police" }},
        { "lat": 51.4713341, "lon": -0.1329247, "tags": { "name": "Unknown Police Station" }},
        { "lat": 51.4995953, "lon": -0.0956861, "tags": { "name": "Overseas Visitors Records Office" }},
        { "lat": 51.5103850, "lon": -0.0917020, "tags": { "name": "City of London Police" }}
    ]
};

function addPoliceStationMarkers(policeData) {
    // Ensure policeData is valid and has elements
    if (!policeData || !Array.isArray(policeData.elements)) {
        console.error('Invalid police data format.');
        return;
    }

    // Iterate over each police station and add it to the map
    policeData.elements.forEach(station => {
        const stationLat = station.lat;
        const stationLon = station.lon;

        // Check if coordinates exist
        if (stationLat && stationLon) {
            const stationLatLng = L.latLng(stationLat, stationLon);

            // Use the default Leaflet marker icon for police stations
            L.marker(stationLatLng).addTo(map)
                .bindPopup(`<b>Police Station:</b> ${station.tags.name}`);
        } else {
            console.error('Invalid station coordinates:', station);
        }
    });
}





// Initialize the map
function initializeMap() {
    map = L.map('map').setView([51.509865, -0.118092], 14);  // London coordinates
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    return map;
}

// Function to sort data chronologically by datetime
function sortDataChronologically(data) {
    return data.sort((a, b) => {
        const dateA = new Date(a.datetime);
        const dateB = new Date(b.datetime);
        return dateA - dateB;
    });
}

// Function to fetch and display crime data
function fetchCrimeData(month, callback) {
    clearContent();  
    const csvUrl = monthUrls[month];

    if (!csvUrl) {
        console.error('No CSV URL available for the selected month:', month);
        return;
    }

    // Fetch the CSV file from the URL
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvData => {
            // Parse the CSV data using PapaParse
            const parsedData = Papa.parse(csvData, { header: true }).data;

            if (!parsedData || parsedData.length === 0) {
                console.warn('No data available or data is empty');
                alert('No data available for the selected month.');
                return;
            }

            console.log('Fetched and parsed data:', parsedData);

            // Sort data by date for consistency
            const sortedData = sortDataChronologically(parsedData);

            callback(sortedData);  // Pass the sorted data to the callback function
        })
        .catch(error => {
            console.error('Error fetching CSV data:', error);
        });
}


    
// Function to place markers on the map for the crime data
function loadMarkersForMonth() {
    const selectedMonth = document.getElementById('month-select') ? document.getElementById('month-select').value : "2024-06";
    clearContent();  // Clear existing markers

    // Fetch crime data and place markers on the map
    fetchCrimeData(selectedMonth, sortedData => {
        markersLayer = L.layerGroup().addTo(map);  // Initialize markers layer

        sortedData.forEach(crime => {
            const lat = parseFloat(crime.latitude);
            const lng = parseFloat(crime.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                L.marker([lat, lng]).addTo(markersLayer)
                    .bindPopup(`<b>Object of search:</b> ${crime.object_of_search || "Unknown"}<br>
                                <b>Outcome:</b> ${crime.outcome_name || "Unknown"}<br>
                                <b>Age Range:</b> ${crime.age_range || "Unknown"}<br>
                                <b>Gender:</b> ${crime.gender || "Unknown"}<br>
                                <b>Date/Time:</b> ${crime.datetime}<br>
                                <b>Type:</b> ${crime.type || "Unknown"}`);
            }
        });
    });
}

// Function for GIS analysis (example: proximity analysis)
// Function for GIS analysis (example: proximity analysis)
function loadGISAnalysis() {
    const selectedMonth = document.getElementById('month-select') ? document.getElementById('month-select').value : "2024-06";
    clearContent();

    // Fetch crime data and then perform proximity analysis
    fetchCrimeData(selectedMonth, crimesData => {
        if (crimesData && Array.isArray(crimesData)) {
            // Pass policeData.elements instead of policeData
            performProximityAnalysis(crimesData, policeData.elements, map);
        } else {
            console.error('Crime data is not valid:', crimesData);
        }
    });
}


function performProximityAnalysis(crimeData, policeStations, map) {
    console.log('Crime Data:', crimeData);  // Log crime data
    console.log('Police Stations:', policeStations);  // Log police data

    if (!Array.isArray(crimeData) || !Array.isArray(policeStations)) {
        console.error('Invalid crime or police data');
        return;
    }

    policeStations.forEach(station => {
        const stationLat = station.lat;
        const stationLon = station.lon;

        if (stationLat && stationLon) {
            const stationLatLng = L.latLng(stationLat, stationLon);

            // Create a circle around the police station (500 meters radius, adjustable)
            const circle = L.circle(stationLatLng, {
                color: 'yellow',
                fillColor: '#30A9DE',
                fillOpacity: 0.2,
                radius: 500 // Set the radius to 500 meters (adjust as needed)
            }).addTo(map);

            // Add a popup for the police station
            L.marker(stationLatLng)
                .addTo(map)
                .bindPopup(`<b>Police Station:</b> ${station.tags.name}`);
        }
    });

    markersLayer = L.layerGroup().addTo(map);
    crimeData.forEach(crime => {
        const lat = parseFloat(crime.latitude);
        const lng = parseFloat(crime.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            L.marker([lat, lng]).addTo(markersLayer)
                .bindPopup(`<b>Object of search:</b> ${crime.object_of_search || "Unknown"}<br>
                            <b>Outcome:</b> ${crime.outcome_name || "Unknown"}<br>
                            <b>Age Range:</b> ${crime.age_range || "Unknown"}<br>
                            <b>Gender:</b> ${crime.gender || "Unknown"}<br>
                            <b>Date/Time:</b> ${crime.datetime}<br>
                            <b>Type:</b> ${crime.type || "Unknown"}`);
        } else {
            console.log('Invalid crime coordinates:', crime);
        }
    });
}




// Function for clustered map
function loadClusteredMap() {
    const selectedMonth = document.getElementById('month-select') ? document.getElementById('month-select').value : "2024-06";
    clearContent();  // Clear previous layers

    // Fetch crime data and cluster the markers on the map
    fetchCrimeData(selectedMonth, sortedData => {
        clusteredLayer = L.markerClusterGroup();

        sortedData.forEach(crime => {
            const lat = parseFloat(crime.latitude);
            const lng = parseFloat(crime.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                L.marker([lat, lng])
                    .bindPopup(`<b>Object of search:</b> ${crime.object_of_search || "Unknown"}<br>
                                <b>Outcome:</b> ${crime.outcome_name || "Unknown"}<br>
                                <b>Age Range:</b> ${crime.age_range || "Unknown"}<br>
                                <b>Gender:</b> ${crime.gender || "Unknown"}<br>
                                <b>Date/Time:</b> ${crime.datetime}<br>
                                <b>Type:</b> ${crime.type || "Unknown"}`)
                    .addTo(clusteredLayer);
            }
        });

        map.addLayer(clusteredLayer);
    });
}

// Function for heatmap
function loadHeatmap() {
    const selectedMonth = document.getElementById('month-select') ? document.getElementById('month-select').value : "2024-06";
    clearContent();  // Clear previous layers

    // Fetch crime data and generate heatmap
    fetchCrimeData(selectedMonth, sortedData => {
        const heatArray = [];
        sortedData.forEach(crime => {
            const lat = parseFloat(crime.latitude);
            const lng = parseFloat(crime.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                heatArray.push([lat, lng]);
            }
        });

        heatLayer = L.heatLayer(heatArray, { radius: 25 }).addTo(map);
    });
}

// Function to clear the map content (remove all layers)
function clearContent() {
    if (markersLayer) {
        map.removeLayer(markersLayer);
        markersLayer = null;
    }
    if (clusteredLayer) {
        map.removeLayer(clusteredLayer);
        clusteredLayer = null;
    }
    if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
    }
    if (polygonLayer) {
        map.removeLayer(polygonLayer);
        polygonLayer = null;
    }

    // Remove both circles and polylines, excluding tile layers
    map.eachLayer(layer => {
        if ((layer instanceof L.Polyline || layer instanceof L.Circle) && !(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
        }
    });
}


// Initialize the map and event listeners
document.addEventListener('DOMContentLoaded', () => {
    map = initializeMap();  // Initialize the map when the page is ready
    fetchCrimeData("2024-06", loadMarkersForMonth);  // Default to June 2024

    // Event listener for applying month filter
    const applyMonthButton = document.getElementById('apply-month');
    if (applyMonthButton) {
        applyMonthButton.addEventListener('click', loadMarkersForMonth);
    }

    // Event listener for GIS Analysis button
    const gisAnalysisButton = document.getElementById('gis-analysis');
    if (gisAnalysisButton) {
        gisAnalysisButton.addEventListener('click', loadGISAnalysis);
    }

    // Event listener for clustered map button
    const clusteredMapButton = document.getElementById('clustered-map');
    if (clusteredMapButton) {
        clusteredMapButton.addEventListener('click', loadClusteredMap);
    }

    // Event listener for heatmap button
    const heatmapButton = document.getElementById('heatmap');
    if (heatmapButton) {
        heatmapButton.addEventListener('click', loadHeatmap);
    }
});