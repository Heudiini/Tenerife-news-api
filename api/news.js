const axios = require("axios");
const cheerio = require("cheerio");

async function fetchNewsFromCanarianWeekly(page = 1) {
  const url = `https://www.canarianweekly.com/category/tenerife/page/${page}/`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $(".category-posts .post").each((i, element) => {
      const title = $(element).find("h3 a").text().trim();
      const link = $(element).find("h3 a").attr("href");
      const image = $(element).find("img").attr("src") || "";
      const date = $(element).find(".entry-date").text().trim() || "Unknown";

      if (title && link) {
        articles.push({
          title,
          link,
          image,
          date,
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

    const news = await fetchNewsFromCanarianWeekly(page);

    // Muutetaan päivämäärät Date-objekteiksi
    const formattedNews = news.map((article) => {
      const date = new Date(article.date);
      return {
        ...article,
        date: isNaN(date.getTime()) ? new Date() : date,
      };
    });

    // Järjestetään uutiset päivämäärän mukaan (uusimmasta vanhimpaan)
    formattedNews.sort((a, b) => b.date - a.date);

    // Sivutetaan uutiset
    const totalPages = Math.ceil(formattedNews.length / limit);
    const paginatedNews = formattedNews.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      page,
      totalPages,
      news: paginatedNews,
    });
  } catch (error) {
    console.error("Error fetching news articles:", error.message);
    res.status(500).json({
      error: "News fetching failed",
      details: error.message,
    });
  }
};
