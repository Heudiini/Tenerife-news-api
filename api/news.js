const axios = require("axios");
const cheerio = require("cheerio");

async function fetchNewsFromCanarianWeekly(page = 1, pageSize = 5) {
  const url = "https://www.canarianweekly.com/";
  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const $ = cheerio.load(response.data);
    const articles = [];

    $("a[href^='/posts/']").each((i, el) => {
      if (i >= pageSize * (page - 1) && i < pageSize * page) {
        const title = $(el).text().trim();
        const link = $(el).attr("href");
        const dateText = $(el)
          .closest(".article-item")
          .find(".date")
          .text()
          .trim();
        const date = dateText || new Date().toLocaleDateString();
        if (title && link) {
          articles.push({
            title,
            link: `https://www.canarianweekly.com${link}`,
            date,
            image: "https://picsum.photos/200",
            source: "canarian-weekly",
          });
        }
      }
    });

    const totalArticles = $("a[href^='/posts/']").length;
    const totalPages = Math.ceil(totalArticles / pageSize);

    return { articles, totalArticles, totalPages };
  } catch (error) {
    console.error("Error fetching from Canarian Weekly:", error.message);
    return { articles: [], totalArticles: 0, totalPages: 0 };
  }
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;

  try {
    const { articles, totalArticles, totalPages } =
      await fetchNewsFromCanarianWeekly(page, pageSize);
    res.status(200).json({ news: articles, totalArticles, totalPages });
  } catch (error) {
    console.error("Error in API handler:", error.message);
    res
      .status(500)
      .json({ error: "News fetching failed", details: error.message });
  }
};
