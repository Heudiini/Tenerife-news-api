const axios = require("axios");
const cheerio = require("cheerio");

// Google Translate API käännöstoiminto
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

// Haetaan uutisia Tenerife News -sivustolta
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

// Haetaan uutisia Planeta Canario -sivustolta
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

// Haetaan uutisia myös muista lähteistä
const fetchNewsFromOtherSources = async (page = 1) => {
  const sources = [
    "https://www.canarianweekly.com/api/v1/news", // Canarian Weekly
    "https://www.tenerifeweekly.com/api/v1/news", // Tenerife Weekly
    "https://www.thecanary.co/api/v1/news", // The Canary
    "https://www.tenerifetoday.com/api/v1/news", // Tenerife Today
    "https://www.surinenglish.com/api/v1/news", // Sur in English
    "https://www.eldia.es/api/v1/news", // El Día
  ];

  const newsPromises = sources.map(async (source) => {
    const response = await axios.get(source);
    const articles = response.data.articles.map((article) => ({
      title: article.title,
      url: article.url,
      image: article.image,
      source: source,
      date: article.date,
    }));

    return articles;
  });

  const allArticles = await Promise.all(newsPromises);
  return allArticles.flat();
};

// Päätoiminto, joka yhdistää kaikki uutiset
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { page = 1, limit = 10 } = req.query;

    // Haetaan uutiset kaikista lähteistä
    const newsFromTenerifeNews = await fetchNewsFromTenerifeNews(
      parseInt(page)
    );
    const newsFromPlanetaCanario = await fetchNewsFromPlanetaCanario(
      parseInt(page)
    );
    const newsFromOtherSources = await fetchNewsFromOtherSources(
      parseInt(page)
    );

    // Yhdistetään kaikki uutiset
    const allNews = [
      ...newsFromTenerifeNews,
      ...newsFromPlanetaCanario,
      ...newsFromOtherSources,
    ];

    // Sivutetaan uutiset
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
