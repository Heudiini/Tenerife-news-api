const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const newspapers = [
  {
    name: "tenerife-news",
    address: "https://www.tenerifenews.com/",
    base: "https://www.tenerifenews.com",
  },
  {
    name: "abc-es",
    address: "https://www.abc.es/",
    base: "https://www.abc.es",
  },
  {
    name: "planeta-canario",
    address: "https://planetacanario.com/",
    base: "https://planetacanario.com",
  },
  {
    name: "diario-de-avisos",
    address: "https://diariodeavisos.elespanol.com/",
    base: "https://diariodeavisos.elespanol.com",
  },
  {
    name: "el-dia",
    address: "https://www.eldia.es/tenerife/",
    base: "https://www.eldia.es",
  },
];

const fetchArticles = async () => {
  const articles = [];

  await Promise.all(
    newspapers.map(async (newspaper) => {
      try {
        const response = await axios.get(newspaper.address);
        const html = response.data;
        const $ = cheerio.load(html);

        $("a").each(function () {
          const title = $(this).text().trim();
          let url = $(this).attr("href");
          const image = $(this).closest("article").find("img").attr("src");

          // Tarkistetaan, että URL on olemassa
          if (!url) return;

          // Muunnetaan suhteelliset URL:t absoluuttisiksi
          if (!url.startsWith("http")) {
            url = newspaper.base + url;
          }

          // Muunnetaan suhteelliset kuvalinkit absoluuttisiksi
          let imageUrl = image
            ? image.startsWith("http")
              ? image
              : newspaper.base + image
            : "";

          // Tarkistetaan, että uutinen liittyy Teneriffaan
          if (
            (title.toLowerCase().includes("tenerife") ||
              title.toLowerCase().includes("santa cruz de tenerife")) &&
            !articles.some((article) => article.url === url)
          ) {
            articles.push({
              title,
              url,
              image: imageUrl,
              source: newspaper.name,
            });
          }
        });
      } catch (error) {
        console.log(
          `Virhe haettaessa tietoja sivustolta ${newspaper.name}:`,
          error.message
        );
      }
    })
  );

  return articles.slice(0, 50);
};

// Pääsivu
app.get("/", (req, res) => {
  res.json("Tervetuloa uutis-API:in! Tässä on uutisia Tenerifeltä.");
});

// Uutisten API-reitti
app.get("/news", async (req, res) => {
  try {
    const allArticles = await fetchArticles();
    res.json(allArticles);
  } catch (error) {
    res.status(500).json({ error: "Uutisia ei voitu hakea juuri nyt." });
  }
});

// Palvelimen käynnistys
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`API toimii osoitteessa http://localhost:${PORT}`)
);

module.exports = app;
