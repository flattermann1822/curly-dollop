// Firebase initialisieren
//require('dotenv').config();
const firebaseConfig = {
    apiKey: "AIzaSyBVLPqqKlKZf1akZ7Zxm9PZONIjsbmTrXQ",
    authDomain: "prepareandfly.firebaseapp.com",
    projectId: "prepareandfly",
    storageBucket: "prepareandfly.appspot.com",
    messagingSenderId: "1031337548140",
    appId: "1:1031337548140:web:d57006e96636494a417b49"
  };

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
// Funktion zum Parsen des KML-Inhalts
function parseKML(kmlContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, "text/xml");
    const placemarks = xmlDoc.getElementsByTagName("Placemark");
    const coordinatesList = [];

    // Tabelle leeren
    waypointsTable.innerHTML = '';

    // Placemark-Daten auslesen und in die Tabelle einfügen
    Array.from(placemarks).forEach(placemark => {
        const id = placemark.getAttribute('id') || 'N/A';
        const name = placemark.getElementsByTagName('name')[0].textContent || 'N/A';
        const notes = placemark.querySelector('Data[name="notes"]')?.textContent || 'N/A';
        const coordinates = placemark.getElementsByTagName('coordinates')[0].textContent.trim().split(',');
        const lon = coordinates[0];
        const lat = coordinates[1];

        coordinatesList.push({ lat, lon }); // Koordinaten zur späteren Verwendung speichern

        // Zeile für die Tabelle erstellen
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td>${name}</td>
            <td>${notes}</td>
            <td>${lat}</td>
            <td>${lon}</td>
            <td><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">Karte</a></td>
            <td><img src="https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=15&size=150x150&maptype=satellite" alt="Satellite view"></td>
        `;
        waypointsTable.appendChild(row);
    });

    generateExportLinks(coordinatesList); // Export-Links generieren
}
// Funktion zum Generieren der Export-URLs
function generateExportLinks(coordinatesList) {
    // Windy.com URL generieren
    const windyCoords = coordinatesList.map(coord => `${coord.lat},${coord.lon}`).join(';');
    windyUrlInput.value = `https://www.windy.com/route-planner/vfr/${windyCoords}`;

    // Bulletin Koordinaten generieren
    const bulletinCoords = coordinatesList.map(coord => `${coord.lat.replace('.', '')}N${coord.lon.replace('.', '')}E`).join(' DCT ');
    bulletinUrlInput.value = bulletinCoords;

    // SkyVector URL generieren
    const skyvectorCoords = coordinatesList.map(coord => `${coord.lat.slice(0, 4)}N${coord.lon.slice(0, 5)}E`).join(' ');
    skyvectorUrlInput.value = `https://skyvector.com/?fpl=${skyvectorCoords}`;
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