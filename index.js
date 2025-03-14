// index.js
const express = require("express");
const app = express();
const newsRouter = require("./api/news");

// Pääreitti
app.get("/", (req, res) => {
  res.send("Welcome to the Tenerife News API!");
});

// API-reitti
app.use("/api", newsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
