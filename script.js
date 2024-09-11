// Firebase konfigurieren und 

// Firebase initialisieren
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

// Event-Listener für das Dropdown-Menü
airplaneIdSelect.addEventListener('change', loadAirplaneDetails);

// Event-Listener für den Speichern-Button
document.getElementById('saveBtn').addEventListener('click', saveAirplaneDetails);

// Initiales Laden der Flugzeuge und Details beim Laden der Seite
window.onload = loadAirplanes;
