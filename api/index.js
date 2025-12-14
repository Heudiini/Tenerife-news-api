// api/index.js

const newsRouter = require("./news.js");

module.exports = (req, res) => {
  // check if /api/news and GET
  if (req.url === "/api/news" && req.method === "GET") {
    newsRouter(req, res);
  } else {
    res.status(404).send("Not Found");
  }
};
