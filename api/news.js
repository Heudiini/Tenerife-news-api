const axios = require("axios");
const cheerio = require("cheerio");

const translateText = async (text, targetLang = "en") => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;
  try {
    const response = await axios.get(url);
    return response.data[0].map((t) => t[0]).join("");
  } catch (error) {
    console.error("Käännös epäonnistui:", error.message);
    return text; // Palautetaan alkuperäinen teksti, jos käännös epäonnistuu
  }
};

async function fetchNewsFromTenerifeNews(page = 1) {
  const url = `https://www.tenerifenews.com/page/${page}/`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const articles = [];

  const articlePromises = $("article")
    .map(async (i, element) => {
      let title = $(element).find("h2 a").text().trim();
      const url = $(element).find("h2 a").attr("href");
      const image = $(element).find("img").attr("src");
      const date = $(element).find(".date").text().trim();

      if (title && url && image) {
        title = await translateText(title);
        articles.push({
          title,
          url,
          image,
          source: "tenerife-news",
          date,
        });
      }
    })
    .get();

  await Promise.all(articlePromises);
  return articles;
}

async function fetchNewsFromPlanetaCanario(page = 1) {
  const url = `https://planetacanario.com/page/${page}/`;
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const articles = [];

  const articlePromises = $("article")
    .map(async (i, element) => {
      let title = $(element).find("h2 a").text().trim();
      const url = $(element).find("h2 a").attr("href");
      const image = $(element).find("img").attr("src");
      const date = $(element).find(".date").text().trim();

      if (title && url && image) {
        title = await translateText(title);
        articles.push({
          title,
          url,
          image,
          source: "planeta-canario",
          date,
        });
      }
    })
    .get();

  await Promise.all(articlePromises);
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
    const { page = 1, limit = 10 } = req.query;

    const newsFromTenerifeNews = await fetchNewsFromTenerifeNews(
      parseInt(page)
    );
    const newsFromPlanetaCanario = await fetchNewsFromPlanetaCanario(
      parseInt(page)
    );

    const allNews = [...newsFromTenerifeNews, ...newsFromPlanetaCanario];

    const totalPages = Math.ceil(allNews.length / limit);
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
