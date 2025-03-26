const axios = require("axios");
const cheerio = require("cheerio");

async function fetchNewsFromCanarianWeekly(page = 1, pageSize = 5) {
  const url = "https://www.canarianweekly.com/";
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $("a[href^='/posts/']").each((i, element) => {
      if (i >= pageSize * (page - 1) && i < pageSize * page) {
        // Apply pagination logic here
        const title = $(element).text().trim();
        const link = $(element).attr("href");
        const image =
          $(element).find("img").attr("src") ||
          "https://example.com/default-image.jpg"; // Oletuskuva
        let date = $(element)
          .closest(".article-item")
          .find(".date")
          .text()
          .trim();

        // Jos päivämäärä ei löydy, käytä nykyistä päivämäärää
        if (!date) {
          date = new Date().toLocaleDateString(); // Nykyinen päivämäärä
        }

        if (title && link) {
          articles.push({
            title,
            link: `https://www.canarianweekly.com${link}`,
            image,
            date,
            source: "canarian-weekly",
          });
        }
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

  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 5; // Default to 5 articles per page

  try {
    const newsFromCanarianWeekly = await fetchNewsFromCanarianWeekly(
      page,
      pageSize
    );

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
