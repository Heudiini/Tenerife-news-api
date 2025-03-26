const axios = require("axios");
const cheerio = require("cheerio");

async function fetchImageFromArticle(link) {
  try {
    const response = await axios.get(link); // Hae artikkeli
    const $ = cheerio.load(response.data); // Lataa HTML
    const imageUrl = $("img").first().attr("src"); // Oletetaan, että ensimmäinen <img> tagi on se, mitä etsit

    // Jos kuva löytyy, palauta sen URL
    if (imageUrl) {
      // Tarkista, onko kuva suhteellinen ja lisää täysi URL tarvittaessa
      if (!imageUrl.startsWith("http")) {
        const baseUrl = new URL(link); // Perustaa URL:n linkistä
        return baseUrl.origin + imageUrl; // Palauta täysi URL
      }
      return imageUrl; // Palauta suoraan
    } else {
      // Jos kuvaa ei löydy, palauta oletuskuva
      return "https://example.com/default-image.jpg";
    }
  } catch (error) {
    console.error("Virhe haettaessa kuvaa:", error);
    return "https://example.com/default-image.jpg"; // Palauta oletuskuva virheen sattuessa
  }
}

async function fetchNewsFromCanarianWeekly(page = 1, pageSize = 5) {
  const url = "https://www.canarianweekly.com/";
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    // Käydään läpi artikkelit ja haetaan niille kuvat
    const articlePromises = $("a[href^='/posts/']")
      .map(async (i, element) => {
        if (i >= pageSize * (page - 1) && i < pageSize * page) {
          // Apply pagination logic here
          const title = $(element).text().trim();
          const link = $(element).attr("href");
          let image =
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
            // Haetaan kuvan URL suoraan artikkelista
            const fullImageUrl = await fetchImageFromArticle(
              `https://www.canarianweekly.com${link}`
            );
            return {
              title,
              link: `https://www.canarianweekly.com${link}`,
              image: fullImageUrl, // Käytetään artikkelista haettua kuvaa
              date,
              source: "canarian-weekly",
            };
          }
        }
      })
      .get(); // `.get()` palauttaa taulukon kaikkien lupauksien tuloksista

    // Odotetaan, että kaikki artikkelit on haettu
    const resolvedArticles = await Promise.all(articlePromises);

    // Suodatetaan pois tyhjät artikkelit (jos sellaisia on)
    return resolvedArticles.filter((article) => article);
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
