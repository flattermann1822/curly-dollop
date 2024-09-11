// Firebase konfigurieren und initialisieren
var firebaseConfig = {
    apiKey: "AIzaSyCP9hjGOd37eCOWvLMP7euAjBnJh0xp1eU",
    authDomain: "userdataproject-62527.firebaseapp.com",
    projectId: "userdataproject-62527",
    storageBucket: "userdataproject-62527.appspot.com",
    messagingSenderId: "248653506177",
    appId: "1:248653506177:web:6214a1d03f849992c54f80"
};

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
            option.textContent = data.ID || doc.id; // Zeige das "ID"-Feld oder die Dokument-ID an
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
        const confirmSave = confirm("Möchten Sie die Änderungen speichern? Wählen Sie 'OK' zum Überschreiben oder 'Abbrechen' zum Erstellen eines neuen Dokuments.");
        try {
            if (confirmSave) {
                // Aktualisieren eines bestehenden Dokuments
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
                    maxCrosswind_kt: maxCrosswindInput.value
                }, { merge: true });
                alert("Dokument erfolgreich aktualisiert!");
            } else {
                // Erstellen eines neuen Dokuments
                const newId = db.collection('Airplanes').doc().id;
                await db.collection('Airplanes').doc(newId).set({
                    EmptyWeight_kg: emptyWeightInput.value,
                    MTOW_kg: mtowInput.value,
                    Payload_kg: payloadInput.value,
                    startDistance0m_m: startDistance0mInput.value,
                    startDistance15m_m: startDistance15mInput.value,
                    ConsumptionTypical_l: consumptionInput.value,
                    SN: snInput.value,
                    SpeedCruise_kmh: speedCruiseInput.value,
                    Type: typeInput.value,
                    maxCrosswind_kt: maxCrosswindInput.value
                });
                alert("Neues Dokument erfolgreich erstellt!");
                // Dropdown aktualisieren
                const option = document.createElement('option');
                option.value = newId;
                option.textContent = newId; // Zeige die neue ID im Dropdown an
                option.title = newId; // Zeige die neue ID beim Mouseover an
                airplaneIdSelect.appendChild(option);
                airplaneIdSelect.value = newId;
            }
        } catch (error) {
            console.error("Fehler beim Speichern der Daten:", error);
        }
    }
}

// Event-Listener für das Dropdown-Menü
airplaneIdSelect.addEventListener('change', loadAirplaneDetails);

// Event-Listener für den Speichern-Button
document.getElementById('saveBtn').addEventListener('click', saveAirplaneDetails);

// Initiales Laden der Flugzeuge und Details beim Laden der Seite
window.onload = loadAirplanes;
