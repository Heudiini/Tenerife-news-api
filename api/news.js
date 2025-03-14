const axios = require("axios");
const cheerio = require("cheerio");

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

  try {
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

            if (!url) return;

            if (!url.startsWith("http")) {
              url = newspaper.base + url;
            }

            let imageUrl = image
              ? image.startsWith("http")
                ? image
                : newspaper.base + image
              : "";

            if (
              (title.toLowerCase().includes("tenerife") ||
                title.toLowerCase().includes("santa cruz de tenerife")) &&
              !articles.some((article) => article.url === url) &&
              imageUrl
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
  } catch (error) {
    console.log("Virhe uutisten hakemisessa:", error.message);
  }

  return articles.slice(0, 50);
};

module.exports = async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const allArticles = await fetchArticles();
    const limitedArticles = allArticles.slice(0, limit);
    if (limitedArticles.length === 0) {
      return res.json({ message: "Ei uutisia löytynyt tällä hetkellä." });
    }
    return res.json(limitedArticles);
  } catch (error) {
    return res.status(500).json({ error: "Uutisia ei voitu hakea juuri nyt." });
  }
};
