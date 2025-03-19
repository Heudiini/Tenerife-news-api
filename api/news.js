const axios = require("axios");
const cheerio = require("cheerio");
const translate = require("google-translate-api"); // Lisää Google-käännös-kirjasto

// Funktio uutisten hakemiseen
async function fetchNewsFromSource(url, sourceName, page = 1) {
  try {
    const response = await axios.get(`${url}?page=${page}`);
    const $ = cheerio.load(response.data);
    const articles = [];

    $("article").each((i, element) => {
      const title = $(element).find("h2 a").text().trim();
      const articleUrl = $(element).find("h2 a").attr("href");
      const image = $(element).find("img").attr("src");
      const date = $(element).find("time").attr("datetime") || "Unknown";

      if (title && articleUrl && image) {
        articles.push({
          title,
          url: articleUrl,
          image,
          source: sourceName,
          date,
        });
      }
    });

    return articles;
  } catch (error) {
    console.error(`Error fetching from ${sourceName}:`, error.message);
    return [];
  }
}

// Funktio uutisten kääntämiseksi espanjasta englanniksi
async function translateNewsToEnglish(news) {
  try {
    if (news.title && news.title !== "") {
      const translated = await translate(news.title, { to: "en" });
      news.title = translated.text;
    }
    return news;
  } catch (error) {
    console.error("Error translating news:", error.message);
    return news;
  }
}

// Pääsovellus
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Lisää lähteet
    const sources = [
      {
        url: "https://www.tenerifenews.com/api/v1/news",
        sourceName: "tenerife-news",
      },
      {
        url: "https://www.planetacanario.com/api/v1/news",
        sourceName: "planeta-canario",
      },
      {
        url: "https://www.canarianweekly.com/api/v1/news",
        sourceName: "canarian-weekly",
      },
      {
        url: "https://www.tenerifeweekly.com/api/v1/news",
        sourceName: "tenerife-weekly",
      },
      { url: "https://www.thecanary.co/api/v1/news", sourceName: "the-canary" },
      {
        url: "https://www.tenerifetoday.com/api/v1/news",
        sourceName: "tenerife-today",
      },
      {
        url: "https://www.surinenglish.com/api/v1/news",
        sourceName: "sur-in-english",
      },
      { url: "https://www.eldia.es/api/v1/news", sourceName: "el-dia" },
    ];

    // Haetaan uutiset kaikista lähteistä
    const newsPromises = sources.map((source) =>
      fetchNewsFromSource(source.url, source.sourceName, page)
    );
    const allNews = await Promise.all(newsPromises);
    let combinedNews = allNews.flat();

    // Käännetään espanjankieliset uutiset englanniksi
    for (let news of combinedNews) {
      // Oletetaan, että jos uutinen on espanjaksi, sen otsikko voi olla esimerkiksi "titulo en español"
      if (news.title && news.title.includes("en español")) {
        // Tarkista, jos uutinen on espanjaksi
        news = await translateNewsToEnglish(news);
      }
    }

    // Järjestetään uutiset päiväyksen mukaan
    combinedNews.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    // Sivutetaan uutiset
    const totalPages = Math.ceil(combinedNews.length / limit);
    const paginatedNews = combinedNews.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      page,
      totalPages,
      news: paginatedNews,
    });
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.status(500).json({
      error: "News fetching failed",
      details: error.message,
    });
  }
};
