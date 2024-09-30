const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 8000;

const newspapers = [
  {
    name: "tenerife-news",
    address: "https://www.tenerifenews.com/",
    base: "",
  },
  {
    name: "abc-es",
    address: "https://www.abc.es/",
    base: "",
  },
  {
    name: "planeta-canario",
    address: "https://planetacanario.com/",
    base: "",
  },
  {
    name: "diario-de-avisos",
    address: "https://diariodeavisos.elespanol.com/",
    base: "",
  },
  {
    name: "el-dia",
    address: "https://www.eldia.es/tenerife/",
    base: "",
  },
];

const articles = [];

const fetchArticles = async () => {
  articles.length = 0;

  await Promise.all(
    newspapers.map(async (newspaper) => {
      try {
        const response = await axios.get(newspaper.address);
        const html = response.data;
        const $ = cheerio.load(html);

        $("a").each(function () {
          const title = $(this).text().trim();
          const url = $(this).attr("href");
          const image = $(this).closest("article").find("img").attr("src");

          const excerpt =
            $(this)
              .closest("article")
              .find("p")
              .text()
              .trim()
              .substring(0, 100) + "...";

          if (
            (title.toLowerCase().includes("tenerife") ||
              title.toLowerCase().includes("santa cruz de tenerife")) &&
            !articles.some((article) => article.url === url)
          ) {
            articles.push({
              title: title,
              url: url.startsWith("http") ? url : newspaper.base + url,
              excerpt: excerpt || title,
              image: image && image.startsWith("http") ? image : "",
              source: newspaper.name,
            });
          }
        });
      } catch (error) {
        console.log(`Error fetching from ${newspaper.name}:`, error.message);
      }
    })
  );

  return articles.slice(0, 50);
};

app.get("/", (req, res) => {
  res.json("Tervetuloa uutis-API:in! Tässä on uutisia Tenerifeltä.");
});

app.get("/news", async (req, res) => {
  const allArticles = await fetchArticles();
  res.json(allArticles);
});

app.listen(PORT, () => console.log(`Palvelin käynnissä portissa ${PORT}`));
