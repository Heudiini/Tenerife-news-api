const axios = require("axios");
const cheerio = require("cheerio");

async function fetchNewsFromTenerifeNews() {
  const url = "https://www.tenerifenews.com";
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const articles = [];

  $("article").each((i, element) => {
    const title = $(element).find("h2 a").text().trim();
    const url = $(element).find("h2 a").attr("href");
    const image = $(element).find("img").attr("src");
    const date = $(element).find(".date").text().trim();

    if (title && url && image) {
      articles.push({
        title,
        url,
        image,
        source: "tenerife-news",
        date,
      });
    }
  });

  return articles;
}

async function fetchNewsFromPlanetaCanario() {
  const url = "https://planetacanario.com";
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const articles = [];

  $("article").each((i, element) => {
    const title = $(element).find("h2 a").text().trim();
    const url = $(element).find("h2 a").attr("href");
    const image = $(element).find("img").attr("src");
    const date = $(element).find(".date").text().trim();

    if (title && url && image) {
      articles.push({
        title,
        url,
        image,
        source: "planeta-canario",
        date,
      });
    }
  });

  return articles;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Haetaan uutiset molemmista lähteistä
    const newsFromTenerifeNews = await fetchNewsFromTenerifeNews();
    const newsFromPlanetaCanario = await fetchNewsFromPlanetaCanario();

    // Yhdistetään uutiset
    const allNews = [...newsFromTenerifeNews, ...newsFromPlanetaCanario];

    res.status(200).json(allNews);
  } catch (error) {
    console.error("Virhe uutisten hakemisessa:", error.message);
    res.status(500).json({
      error: "Uutisten hakeminen epäonnistui",
      details: error.message,
    });
  }
};
