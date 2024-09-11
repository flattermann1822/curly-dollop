document.getElementById('fpl-upload').addEventListener('change', handleFPLUpload);
document.getElementById('html-upload').addEventListener('change', handleHTMLUpload);
document.getElementById('weather-btn').addEventListener('click', openWeatherLink);
document.getElementById('save-btn').addEventListener('click', saveFlightPreparation);

let waypoints = [];
let airportInfo = {}; // Objekt zum Speichern der Flugplatzinformationen

function handleFPLUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(e.target.result, "text/xml");

        // Extrahiere Wegpunkte
        const waypointsXML = xmlDoc.getElementsByTagName('waypoint');
        waypoints = Array.from(waypointsXML).map(waypoint => {
            return {
                identifier: waypoint.getElementsByTagName('identifier')[0]?.textContent || 'N/A',
                lat: waypoint.getElementsByTagName('lat')[0]?.textContent || 'N/A',
                lon: waypoint.getElementsByTagName('lon')[0]?.textContent || 'N/A'
            };
        });

        // Extrahiere Flugplatzinformationen
        const airportsXML = xmlDoc.getElementsByTagName('airport');
        Array.from(airportsXML).forEach(airport => {
            const icao = airport.getElementsByTagName('icao')[0]?.textContent || 'N/A';
            airportInfo[icao] = {
                name: airport.getElementsByTagName('name')[0]?.textContent || 'N/A',
                frequency: airport.getElementsByTagName('frequency')[0]?.textContent || 'N/A',
                runway: airport.getElementsByTagName('runway')[0]?.textContent || 'N/A',
                heading: airport.getElementsByTagName('heading')[0]?.textContent || 'N/A',
                elevation: airport.getElementsByTagName('elevation')[0]?.textContent || 'N/A'
            };
        });

        displayWaypoints();
        displayAirportInfo();
    };

    reader.readAsText(file);
}

function handleHTMLUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(e.target.result, "text/html");
        const rows = doc.querySelectorAll(".nav tbody tr");

        rows.forEach((row, index) => {
            const cells = row.querySelectorAll("td");

            if (waypoints[index] && cells.length >= 6) {
                waypoints[index].distance = cells[0]?.textContent.trim() || 'N/A';
                waypoints[index].time = cells[1]?.textContent.trim() || 'N/A';
                waypoints[index].course = cells[2]?.textContent.trim() || 'N/A';
                waypoints[index].fuel = cells[5]?.textContent.trim() || 'N/A';
            }
        });

        displayWaypoints();
    };

    reader.readAsText(file);
}

function displayWaypoints() {
    const list = document.getElementById('waypoints-list');
    list.innerHTML = '';
    waypoints.forEach(waypoint => {
        const listItem = document.createElement('li');
        listItem.textContent = `${waypoint.identifier} - Lat: ${waypoint.lat}, Lon: ${waypoint.lon}`;
        if (waypoint.distance) {
            listItem.textContent += `, Dist: ${waypoint.distance}, Time: ${waypoint.time}, Course: ${waypoint.course}, Fuel: ${waypoint.fuel}`;
        }
        list.appendChild(listItem);
    });
}

function displayAirportInfo() {
    const list = document.getElementById('airport-info');
    list.innerHTML = '';
    Object.keys(airportInfo).forEach(icao => {
        const info = airportInfo[icao];
        const listItem = document.createElement('li');
        listItem.textContent = `${icao} - ${info.name}, Freq: ${info.frequency}, RWY: ${info.runway}, HDG: ${info.heading}, Elev: ${info.elevation}`;
        list.appendChild(listItem);
    });
}

function openWeatherLink() {
    if (waypoints.length === 0) {
        alert('Bitte laden Sie die .FPL-Datei hoch.');
        return;
    }

    const coords = waypoints.map(wp => `${wp.lat},${wp.lon}`).join(';');
    const weatherUrl = `https://www.windy.com/route-planner/vfr/${coords}`;
    window.open(weatherUrl, '_blank');
}

function saveFlightPreparation() {
    const flightData = {
        waypoints: waypoints,
        airportInfo: airportInfo,
        date: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flightData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "flugvorbereitung_" + new Date().toISOString() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
