// index.js
const express = require("express");
const app = express();
const newsRouter = require("./api/news");

app.use("/api", newsRouter);
// index.js

// Määritetään pääreitti, joka palauttaa "Hello World" tai muuta tervetulotoivotusta
app.get("/", (req, res) => {
  res.send("Welcome to the Tenerife News API!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
