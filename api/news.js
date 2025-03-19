const axios = require("axios");
const cheerio = require("cheerio");

async function fetchNewsFromTenerifeNews(page = 1) {
  const url = `https://www.tenerifenews.com/page/${page}/`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $("article").each((i, element) => {
      const title = $(element).find("h2 a").text().trim();
      const url = $(element).find("h2 a").attr("href");
      const image = $(element).find("img").attr("src");
      const date = $(element).find(".entry-date").text().trim() || "Unknown";

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
  } catch (error) {
    console.error("Error fetching from Tenerife News:", error.message);
    return [];
  }
}

async function fetchNewsFromPlanetaCanario(page = 1) {
  const url = `https://planetacanario.com/page/${page}/`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $("article").each((i, element) => {
      const title = $(element).find("h2 a").text().trim();
      const url = $(element).find("h2 a").attr("href");
      const image = $(element).find("img").attr("src");
      const date = $(element).find("time").attr("datetime") || "Unknown";

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
  } catch (error) {
    console.error("Error fetching from Planeta Canario:", error.message);
    return [];
  }
}

async function fetchNewsFromCanarianWeekly(page = 1) {
  const url = `https://www.canarianweekly.com/category/tenerife/page/${page}/`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $(".category-posts .post").each((i, element) => {
      const title = $(element).find("h3 a").text();
      const link = $(element).find("h3 a").attr("href");
      const image = $(element).find("img").attr("src");
      const date = $(element).find(".entry-date").text();

      if (title && link) {
        articles.push({
          title,
          link,
          image: image || "",
          date: date || "",
          source: "canarian-weekly",
        });
      }
    });

    return articles;
  } catch (error) {
    console.error("Error fetching from Canarian Weekly:", error.message);
    return [];
  }
}

async function fetchNewsFromTenerifeWeekly(page = 1) {
  const url = `https://tenerifeweekly.com/page/${page}/`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $(".post .post-header").each((i, element) => {
      const title = $(element).find("h2 a").text();
      const link = $(element).find("h2 a").attr("href");
      const image = $(element).find("img").attr("src");
      const date = $(element).find(".post-meta time").text();

      if (title && link) {
        articles.push({
          title,
          link,
          image: image || "",
          date: date || "",
          source: "tenerife-weekly",
        });
      }
    });

    return articles;
  } catch (error) {
    console.error("Error fetching from Tenerife Weekly:", error.message);
    return [];
  }
}

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

    // Haetaan uutiset kaikista lähteistä
    const [
      newsFromTenerifeNews,
      newsFromPlanetaCanario,
      newsFromCanarianWeekly,
      newsFromTenerifeWeekly,
    ] = await Promise.all([
      fetchNewsFromTenerifeNews(page),
      fetchNewsFromPlanetaCanario(page),
      fetchNewsFromCanarianWeekly(page),
      fetchNewsFromTenerifeWeekly(page),
    ]);

    let allNews = [
      ...newsFromTenerifeNews,
      ...newsFromPlanetaCanario,
      ...newsFromCanarianWeekly,
      ...newsFromTenerifeWeekly,
    ];

    // Järjestetään uutiset päiväyksen mukaan
    allNews.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    // Sivutetaan uutiset
    const totalPages = Math.ceil(allNews.length / limit);
    const paginatedNews = allNews.slice((page - 1) * limit, page * limit);

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
