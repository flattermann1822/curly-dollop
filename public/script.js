// Firebase initialisieren
//require('dotenv').config();


firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// Elemente abrufen
const airplaneIdSelect = document.getElementById('airplaneId');
const emptyWeightInput = document.getElementById('EmptyWeight_kg');
const mtowInput = document.getElementById('MTOW_kg');
const payloadInput = document.getElementById('Payload_kg');
const startDistance0mInput = document.getElementById('startDistance0m_m');
const startDistance15mInput = document.getElementById('startDistance15m_m');
const consumptionInput = document.getElementById('ConsumptionTypical_l');
const snInput = document.getElementById('SN');
const speedCruiseInput = document.getElementById('SpeedCruise_kmh');
const typeInput = document.getElementById('Type');
const maxCrosswindInput = document.getElementById('maxCrosswind_kt');


const kmlFileInput = document.getElementById('kmlFileInput');
const waypointsTable = document.getElementById('waypointsTable').querySelector('tbody');
const windyUrlInput = document.getElementById('windyUrl');
const bulletinUrlInput = document.getElementById('bulletinUrl');
const skyvectorUrlInput = document.getElementById('skyvectorUrl');
const exportBtn = document.getElementById('exportBtn');

// Funktion zum Laden der Flugzeuge in das Dropdown-Menü
async function loadAirplanes() {
    try {
        const snapshot = await db.collection('Airplanes').get();
        airplaneIdSelect.innerHTML = ''; // Dropdown zurücksetzen
        snapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = data.Callsign || doc.id; // Zeige das "Callsign"-Feld oder die Dokument-ID an
            option.title = doc.id; // Zeige die vollständige ID beim Mouseover an
            airplaneIdSelect.appendChild(option);
        });

        // Nach dem Laden der Optionen das erste Dokument auswählen und dessen Details laden
        if (snapshot.size > 0) {
            airplaneIdSelect.value = snapshot.docs[0].id;
            await loadAirplaneDetails(); // Details des ersten Dokuments laden
        }
    } catch (error) {
        console.error("Fehler beim Laden der Flugzeuge:", error);
    }
}

// Funktion zum Laden der Details eines ausgewählten Flugzeugs
async function loadAirplaneDetails() {
    const id = airplaneIdSelect.value;
    if (id) {
        try {
            const doc = await db.collection('Airplanes').doc(id).get();
            if (doc.exists) {
                const data = doc.data();
                emptyWeightInput.value = data.EmptyWeight_kg || '';
                mtowInput.value = data.MTOW_kg || '';
                payloadInput.value = data.Payload_kg || '';
                startDistance0mInput.value = data.startDistance0m_m || '';
                startDistance15mInput.value = data.startDistance15m_m || '';
                consumptionInput.value = data.ConsumptionTypical_l || '';
                snInput.value = data.SN || '';
                speedCruiseInput.value = data.SpeedCruise_kmh || '';
                typeInput.value = data.Type || '';
                maxCrosswindInput.value = data.maxCrosswind_kt || '';
            } else {
                console.log("Dokument nicht gefunden!");
            }
        } catch (error) {
            console.error("Fehler beim Laden der Details:", error);
        }
    }
}

// Funktion zum Speichern der Änderungen
// TODO: Implement new documents
async function saveAirplaneDetails() {
    const id = airplaneIdSelect.value;
    if (id) {
        if (confirm("Möchten Sie die Änderungen speichern?")) {
            try {
                await db.collection('Airplanes').doc(id).set({
                    EmptyWeight_kg: emptyWeightInput.value,
                    MTOW_kg: mtowInput.value,
                    Payload_kg: payloadInput.value,
                    startDistance0m_m: startDistance0mInput.value,
                    startDistance15m_m: startDistance15mInput.value,
                    ConsumptionTypical_l: consumptionInput.value,
                    SN: snInput.value,
                    SpeedCruise_kmh: speedCruiseInput.value,
                    Type: typeInput.value,
                    maxCrosswind_kt: maxCrosswindInput.value,
                    Callsign: snInput.value // Callsign aktualisieren
                }, { merge: true });
                alert("Dokument erfolgreich aktualisiert!");
            } catch (error) {
                console.error("Fehler beim Speichern der Daten:", error);
            }
        }
    }
}
// Funktion zum Parsen der KML-Datei
kmlFileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const kmlText = e.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(kmlText, "application/xml");

            // Wegpunkte aus der KML-Datei extrahieren
            const placemarks = xmlDoc.getElementsByTagName('Placemark');
            waypointsTableBody.innerHTML = ''; // Tabelle leeren

            let waypoints = [];

            for (let i = 0; i < placemarks.length; i++) {
                const placemark = placemarks[i];
                const name = placemark.getElementsByTagName('name')[0]?.textContent || '';
                const notes = placemark.querySelector('Data[name="notes"] value')?.textContent || '';
                const coordinates = placemark.getElementsByTagName('coordinates')[0]?.textContent.trim().split(',');

                const lon = coordinates[0];
                const lat = coordinates[1];

                // In die Tabelle einfügen
                const row = waypointsTableBody.insertRow();
                row.insertCell(0).textContent = name;
                row.insertCell(1).textContent = notes;
                row.insertCell(2).textContent = lat;
                row.insertCell(3).textContent = lon;

                // Elevation API-Aufruf
                fetchElevation(lat, lon, row);

                const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
                const mapsCell = row.insertCell(5);
                const link = document.createElement('a');
                link.href = mapsLink;
                link.textContent = "Google Maps";
                link.target = "_blank";
                mapsCell.appendChild(link);

                // Speichere Wegpunkte für den Export
                waypoints.push({ lat, lon });
            }

            // Export-URLs generieren
            generateExportUrls(waypoints);
        };

        reader.readAsText(file);
    }
});
// Export-URLs generieren
function generateExportUrls(waypoints) {
    const latLonStrings = waypoints.map(wp => `${wp.lat},${wp.lon}`).join(';');

    // Windy.com URL
    const windyUrl = `https://www.windy.com/route-planner/vfr/${latLonStrings}`;
    document.getElementById('windyExport').value = windyUrl;

    // Bulletin format
    const bulletinString = waypoints.map(wp => {
        const latDeg = wp.lat.split('.')[0];
        const lonDeg = wp.lon.split('.')[0];
        return `${latDeg}N${lonDeg}E`;
    }).join(' DCT ');
    document.getElementById('bulletinExport').value = bulletinString;

    // Skyvector URL
    const skyvectorUrl = `https://skyvector.com/?fpl=${waypoints.map(wp => `${wp.lat}N${wp.lon}E`).join(' DCT ')}`;
    document.getElementById('skyvectorExport').value = skyvectorUrl;
}

// Event-Listener für den KML-Dateiimport
kmlFileInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const kmlContent = e.target.result;
            parseKML(kmlContent); // KML-Inhalt parsen und verarbeiten
        };
        reader.readAsText(file);
    }
});
// Funktion zum Abrufen der Höheninformationen (Elevation)
function fetchElevation(lat, lon, row) {
    const elevationApiUrl = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;

    fetch(elevationApiUrl)
        .then(response => response.json())
        .then(data => {
            const elevation = data.results[0].elevation;
            const elevationCell = row.insertCell(4); // Spalte für Elevation
            elevationCell.textContent = elevation ? `${elevation} m` : 'N/A';
        })
        .catch(error => {
            console.error("Elevation API error:", error);
            const elevationCell = row.insertCell(4); // Spalte für Elevation
            elevationCell.textContent = 'N/A';
        });
}

// Export-Button-Funktion (optional für weitere Aktionen)
exportBtn.addEventListener('click', function () {
    alert('Daten wurden exportiert! Überprüfen Sie die URLs.');
});
// Event-Listener für das Dropdown-Menü
airplaneIdSelect.addEventListener('change', loadAirplaneDetails);

// Event-Listener für den Speichern-Button
document.getElementById('saveBtn').addEventListener('click', saveAirplaneDetails);

// Initiales Laden der Flugzeuge und Details beim Laden der Seite
window.onload = loadAirplanes;
//require('dotenv').config();