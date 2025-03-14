const express = require("express");
const newsApi = require("./api/news"); // Varmista, että polku on oikea

const app = express();
const port = 3000;

// Käytetään news.js-tiedostoa API-reittinä
app.use("/api/news", newsApi);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
