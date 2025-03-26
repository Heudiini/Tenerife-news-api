const axios = require("axios");
const cheerio = require("cheerio");

async function fetchNewsFromCanarianWeekly() {
  const url = "https://www.canarianweekly.com/";
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $("a[href^='/posts/']").each((i, element) => {
      const title = $(element).text().trim();
      const link = $(element).attr("href");
      const image = $(element).find("img").attr("src") || "";
      const date =
        $(element).closest(".article-item").find(".date").text().trim() ||
        "Unknown";

      if (title && link) {
        articles.push({
          title,
          link: `https://www.canarianweekly.com${link}`,
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
    const newsFromCanarianWeekly = await fetchNewsFromCanarianWeekly();

    res.status(200).json({
      news: newsFromCanarianWeekly,
    });
  } catch (error) {
    console.error("Error fetching news articles:", error.message);
    res.status(500).json({
      error: "News fetching failed",
      details: error.message,
    });
  }
};
