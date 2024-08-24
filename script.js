document.addEventListener('DOMContentLoaded', function () {
    let waypoints = [];

    function importFPL() {
        const fileInput = document.getElementById('fplFile');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(event.target.result, "application/xml");

                const waypointElements = xmlDoc.getElementsByTagName('waypoint');
                waypoints = []; // Reset waypoints array for each import

                for (let i = 0; i < waypointElements.length; i++) {
                    const identifier = waypointElements[i].getElementsByTagName('identifier')[0].textContent;
                    const lat = waypointElements[i].getElementsByTagName('lat')[0].textContent;
                    const lon = waypointElements[i].getElementsByTagName('lon')[0].textContent;

                    waypoints.push({ identifier, lat, lon });
                }

                const startAirport = waypoints[0]?.identifier || "";
                const destinationAirport = waypoints[waypoints.length - 1]?.identifier || "";

                document.getElementById('startAirport').value = startAirport;
                document.getElementById('destinationAirport').value = destinationAirport;

                // Frequenzen suchen und anzeigen
                searchFrequencies(startAirport, destinationAirport);
            };
            reader.readAsText(file);
        } else {
            alert("Bitte eine FPL-Datei auswählen.");
        }
    }

    function searchFrequencies(start, destination) {
        console.log(`Suche Frequenzen für ${start} und ${destination}...`);

        const frequencies = {
            "EDNY": "123.45 MHz",
            "EDTF": "124.80 MHz"
        };

        if (frequencies[start]) {
            document.getElementById('startFrequency').textContent = frequencies[start];
        } else {
            document.getElementById('startFrequency').textContent = "N/A";
        }

        if (frequencies[destination]) {
            document.getElementById('destinationFrequency').textContent = frequencies[destination];
        } else {
            document.getElementById('destinationFrequency').textContent = "N/A";
        }
    }

    function generateRouteURL() {
        if (waypoints.length === 0) {
            alert("Bitte importiere zuerst eine FPL-Datei.");
            return;
        }

        const urlBase = "https://www.windy.com/route-planner/vfr/";
        const coordinates = waypoints.map(wp => `${parseFloat(wp.lat).toFixed(4)},${parseFloat(wp.lon).toFixed(4)}`).join(";");
        const url = `${urlBase}${coordinates}`;

        // Die URL in einem neuen Tab öffnen
        window.open(url, '_blank');
    }

    // Globale Funktionen zur Verwendung im HTML
    window.importFPL = importFPL;
    window.generateRouteURL = generateRouteURL;
});
