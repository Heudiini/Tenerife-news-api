const axios = require("axios");

// Lisää uutislähteet
const sources = [
  "https://www.tenerifenews.com/",
  "https://planetacanario.com/",
  "https://www.eldia.es/tenerife/",
  "https://diariodeavisos.elespanol.com/",
  "https://www.euroweeklynews.com/",
  "https://www.reuters.com/",
];

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Hae sivunumero ja limit parametrit (oletuksena 1. sivu ja 2 uutista per sivu)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const searchQuery = req.query.search || "Tenerife"; // Käytetään hakusanaa (oletus: "Tenerife")

  // Laske aloitusindeksi ja loppuindeksi
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Luo lista uutisista
  const allNews = [];

  try {
    for (let source of sources) {
      // Hae uutiset jokaiselta lähteeltä
      const response = await axios.get(`${source}?search=${searchQuery}`);
      const articles = response.data.articles;

      // Lisää uutiset allNews-taulukkoon
      allNews.push(...articles);
    }

    // Rajataan uutiset paginationin mukaan
    const paginatedNews = allNews.slice(startIndex, endIndex);

    res.status(200).json({
      page,
      limit,
      total: allNews.length,
      totalPages: Math.ceil(allNews.length / limit),
      data: paginatedNews,
    });
  } catch (error) {
    res.status(500).json({
      error: "Uutisten hakeminen epäonnistui.",
      details: error.message,
    });
  }
};
