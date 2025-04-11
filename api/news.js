const axios = require("axios");
const cheerio = require("cheerio");

async function fetchImageFromArticle(link) {
  try {
    const response = await axios.get(link); // Hae artikkeli
    const $ = cheerio.load(response.data); // Lataa HTML
    const imageUrl = $("img").first().attr("src"); // Hae ensimmäinen kuva-artikkeli

    // Jos kuva löytyy
    if (imageUrl) {
      // Tarkista, onko se täydellinen URL
      if (!imageUrl.startsWith("http")) {
        const baseUrl = new URL(link); // Luo base URL
        return baseUrl.origin + imageUrl; // Liitä se täydelliseksi URL:ksi
      }
      return imageUrl; // Palauta suora kuva-URL
    } else {
      return "https://picsum.photos/100"; // Oletuskuva, jos ei löydy kuvaa
    }
  } catch (error) {
    console.error("Virhe kuvan haussa:", error);
    return "https://picsum.photos/100"; // Oletuskuva virheen sattuessa
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

// Tämä on Vercelin API, joka käsittelee frontendistä tulevat pyynnöt ja vastaa artikkelien tiedoilla ja kuvilla.
module.exports = async (req, res) => {
  // CORS-otsikot
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // CORS OPTIONS pyyntöjen käsittely
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 5; // Default to 5 articles per page

  try {
    // Haetaan artikkelit Canarian Weekly -sivustolta
    const newsFromCanarianWeekly = await fetchNewsFromCanarianWeekly(
      page,
      pageSize
    );

    // Palautetaan artikkelit JSON-muodossa
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
