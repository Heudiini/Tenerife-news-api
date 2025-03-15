const axios = require("axios");
const cheerio = require("cheerio");

const scrapeNews = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Esimerkiksi Tenerifenews.com-sivuston uutisten hakeminen
    const articles = [];
    $("article").each((i, element) => {
      const title = $(element).find("h2").text().trim();
      const link = $(element).find("a").attr("href");
      const image = $(element).find("img").attr("src");
      const source = "tenerife-news"; // Tai voit lisätä sen dynaamisesti
      const date = $(element).find("time").text().trim();

      // Varmistetaan, että uutinen sisältää tarvittavat tiedot
      if (title && link && image) {
        articles.push({
          title,
          url: link,
          image: image.startsWith("http") ? image : `https:${image}`, // Täydellinen URL
          source,
          date,
        });
      }
    });

    return articles;
  } catch (error) {
    console.error("Error scraping news from", url, error);
    return null; // Jos scraper ei toimi, palautetaan null
  }
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Hae hakusana ja rajausparametrit
  const searchQuery = req.query.search || "Tenerife"; // Oletuksena "Tenerife"
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;

  // Rajausparametrit
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Sivustot, joista uutiset haetaan
  const newsSources = [
    "https://www.tenerifenews.com", // Esim. Tenerifenews
    "https://planetacanario.com", // Esim. Planetacanario
    "https://www.eldia.es/tenerife/", // Esim. Eldia
    "https://www.diariodeavisos.com", // Esim. Diariodeavisos
    "https://www.canaryislandsinfo.co.uk", // Canary Islands News
    "https://www.thelocal.es", // The Local Spain
    "https://www.tenerifeweekly.com", // Tenerife Weekly
    "https://www.canarianweekly.com", // Canarian Weekly
    "https://www.elpais.com", // El País
    "https://www.abc.es", // ABC España
    "https://www.lavanguardia.com", // La Vanguardia
  ];

  let allNews = [];

  // Käydään läpi kaikki lähteet ja haetaan uutisia
  for (let i = 0; i < newsSources.length; i++) {
    const articles = await scrapeNews(newsSources[i]);

    // Jos uutiset löytyivät, lisätään ne kokonaislistalle
    if (articles) {
      allNews = [...allNews, ...articles];
    }
  }

  // Suodatetaan uutiset hakusanan perusteella
  const filteredNews = allNews.filter((news) =>
    news.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Rajataan uutiset sivutuksen mukaan
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  res.status(200).json({
    page,
    limit,
    total: filteredNews.length,
    totalPages: Math.ceil(filteredNews.length / limit),
    data: paginatedNews,
  });
};
