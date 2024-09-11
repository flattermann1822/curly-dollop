// Firebase-Konfiguration
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

// Funktion zum Abrufen der Flugzeuge und Befüllen des Dropdowns
async function loadAirplanes() {
    const airplanesDropdown = document.getElementById('airplaneId');
    airplanesDropdown.innerHTML = ''; // Dropdown leeren

    const querySnapshot = await db.collection('Airplanes').get();
    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.text = doc.data().ID; // Das "ID"-Feld aus den Dokumenten
        airplanesDropdown.appendChild(option);
    });

    // Wenn das Dropdown gefüllt ist, initial die Details des ersten Flugzeugs anzeigen
    if (airplanesDropdown.options.length > 0) {
        airplanesDropdown.selectedIndex = 0;
        loadAirplaneDetails(); // Daten des ersten Flugzeugs laden
    }
}

// Funktion zum Abrufen der Flugzeugdetails basierend auf der Auswahl
async function loadAirplaneDetails() {
    const airplaneId = document.getElementById('airplaneId').value;
    const airplaneRef = db.collection('Airplanes').doc(airplaneId);
    const doc = await airplaneRef.get();

    if (doc.exists) {
        const data = doc.data();
        document.getElementById('Consumption').value = data.Consumption;
        document.getElementById('EmptyWeight').value = data.EmptyWeight;
        document.getElementById('MTOW').value = data.MTOW;
        document.getElementById('Payload').value = data.Payload;
        document.getElementById('SN').value = data.SN;
        document.getElementById('SpeedCruise_kmh').value = data.SpeedCruise_kmh;
        document.getElementById('Type').value = data.Type;
        document.getElementById('maxCrosswind_kt').value = data.maxCrosswind_kt;
        document.getElementById('startDistance0m').value = data.startDistance0m;
        document.getElementById('startDistance15m').value = data.startDistance15m;
    } else {
        alert("Keine Daten für das ausgewählte Flugzeug gefunden.");
    }
}

// Funktion zum Speichern der Änderungen
async function saveAirplaneDetails() {
    const airplaneId = document.getElementById('airplaneId').value;
    const newData = {
        Consumption: document.getElementById('Consumption').value,
        EmptyWeight: document.getElementById('EmptyWeight').value,
        MTOW: document.getElementById('MTOW').value,
        Payload: document.getElementById('Payload').value,
        SN: document.getElementById('SN').value,
        SpeedCruise_kmh: document.getElementById('SpeedCruise_kmh').value,
        Type: document.getElementById('Type').value,
        maxCrosswind_kt: document.getElementById('maxCrosswind_kt').value,
        startDistance0m: document.getElementById('startDistance0m').value,
        startDistance15m: document.getElementById('startDistance15m').value
    };

    // Bestätigung einholen
    const overwrite = confirm("Möchtest du die Daten überschreiben oder ein neues Dokument erstellen? OK zum Überschreiben, Abbrechen für neues Dokument.");
    if (overwrite) {
        // Daten in der Datenbank aktualisieren
        await db.collection('Airplanes').doc(airplaneId).update(newData);
        alert("Daten erfolgreich aktualisiert.");
    } else {
        // Neues Dokument anlegen
        await db.collection('Airplanes').add(newData);
        alert("Neues Dokument erfolgreich erstellt.");
    }
}

// Daten laden, wenn die Seite geladen wird
window.onload = function() {
    loadAirplanes();
    document.getElementById('airplaneId').addEventListener('change', loadAirplaneDetails);
    document.getElementById('saveBtn').addEventListener('click', saveAirplaneDetails);
};
