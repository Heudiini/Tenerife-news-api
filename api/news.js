const axios = require("axios");
const cheerio = require("cheerio");

async function fetchNewsFromTenerifeNews(page = 1, limit = 10) {
  const url = `https://www.tenerifenews.com/page/${page}/`; // Oletetaan, että sivut ovat "page/1", "page/2", jne.
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

  return articles; // Ei rajata, koska rajaus tapahtuu päässä
}

async function fetchNewsFromPlanetaCanario(page = 1, limit = 10) {
  const url = `https://planetacanario.com/page/${page}/`; // Oletetaan, että sivut ovat "page/1", "page/2", jne.
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

  return articles; // Ei rajata, koska rajaus tapahtuu päässä
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { page = 1, limit = 10 } = req.query; // Haetaan page ja limit query-parametreista

    // Haetaan uutiset molemmista lähteistä
    const newsFromTenerifeNews = await fetchNewsFromTenerifeNews(
      parseInt(page),
      parseInt(limit)
    );
    const newsFromPlanetaCanario = await fetchNewsFromPlanetaCanario(
      parseInt(page),
      parseInt(limit)
    );

    // Yhdistetään uutiset
    const allNews = [...newsFromTenerifeNews, ...newsFromPlanetaCanario];

    // Lasketaan, kuinka monta sivua on yhteensä
    const totalPages = Math.ceil(allNews.length / limit);

    // Sivutetaan uutiset
    const paginatedNews = allNews.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      page,
      totalPages,
      news: paginatedNews,
    });
  } catch (error) {
    console.error("Virhe uutisten hakemisessa:", error.message);
    res.status(500).json({
      error: "Uutisten hakeminen epäonnistui",
      details: error.message,
    });
  }
};
