const express = require('express');
const path = require('path');
const app = express();

// Statisches HTML, CSS und JS bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
