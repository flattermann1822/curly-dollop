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
        document.getElementById('Consumption').textContent = data.Consumption;
        document.getElementById('EmptyWeight').textContent = data.EmptyWeight;
        document.getElementById('MTOW').textContent = data.MTOW;
        document.getElementById('Payload').textContent = data.Payload;
        document.getElementById('SN').textContent = data.SN;
        document.getElementById('SpeedCruise_kmh').textContent = data.SpeedCruise_kmh;
        document.getElementById('Type').textContent = data.Type;
        document.getElementById('maxCrosswind_kt').textContent = data.maxCrosswind_kt;
        document.getElementById('startDistance0m').textContent = data.startDistance0m;
        document.getElementById('startDistance15m').textContent = data.startDistance15m;
    } else {
        alert("Keine Daten für das ausgewählte Flugzeug gefunden.");
    }
}

// Daten laden, wenn die Seite geladen wird
window.onload = function() {
    loadAirplanes();
    document.getElementById('airplaneId').addEventListener('change', loadAirplaneDetails);
};
