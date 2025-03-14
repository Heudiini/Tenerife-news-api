const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Lataa ympäristömuuttujat .env-tiedostosta

const app = express();
app.use(cors()); // Sallii CORS-pyynnöt
app.use(express.json()); // JSON-datan käsittely

const newsRouter = require("./api/news.js"); // Varmistetaan, että Vercel löytää tiedoston

// Pääreitti
app.get("/", (req, res) => {
  res.send("Welcome to the Tenerife News API!");
});

// API-reitti
app.use("/api/news", newsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
