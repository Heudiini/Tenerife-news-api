// api/index.js

const newsRouter = require("./news.js"); // Varmistetaan, että Vercel löytää tiedoston

module.exports = (req, res) => {
  // Tarkistetaan, onko reitti /api/news ja GET-pyyntö
  if (req.url === "/api/news" && req.method === "GET") {
    newsRouter(req, res);
  } else {
    res.status(404).send("Not Found");
  }
};
