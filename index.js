const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();
const cors = require("cors");

app.use(cors());

const newspapers = [
  {
    name: "cityam",
    address:
      "https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/",
    base: "",
  },
  {
    name: "thetimes",
    address: "https://www.thetimes.co.uk/environment/",
    base: "",
  },
  {
    name: "guardian",
    address: "https://www.theguardian.com/environment/",
    base: "",
  },
  {
    name: "telegraph",
    address: "https://www.telegraph.co.uk",
    base: "https://www.telegraph.co.uk",
  },
  {
    name: "nyt",
    address: "https://www.nytimes.com/international/section",
    base: "",
  },
  {
    name: "latimes",
    address: "https://www.latimes.com/environment",
    base: "",
  },
  {
    name: "smh",
    address: "https://www.smh.com.au/environment",
    base: "https://www.smh.com.au",
  },
  {
    name: "bbc",
    address: "https://www.bbc.co.uk/news/science_and_environment",
    base: "https://www.bbc.co.uk",
  },
  {
    name: "es",
    address: "https://www.standard.co.uk/topic",
    base: "https://www.standard.co.uk",
  },
  {
    name: "sun",
    address: "https://www.thesun.co.uk/topic",
    base: "",
  },
  {
    name: "dm",
    address:
      "https://www.dailymail.co.uk/news/climate_change_global_warming/index.html",
    base: "",
  },
  {
    name: "nyp",
    address: "https://nypost.com/tag",
    base: "",
  },
];

const articles = [];

const fetchArticles = async () => {
  for (const newspaper of newspapers) {
    try {
      const response = await axios.get(newspaper.address);
      const html = response.data;
      const $ = cheerio.load(html);

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text().trim();
        const url = $(this).attr("href");
        let description = $(this).find("p").first().text().trim();

        if (!description) {
          return;
        }

        articles.push({
          title,
          url: newspaper.base + url,
          description,
          source: newspaper.name,
        });

        if (articles.length >= 10) {
          return false;
        }
      });
    } catch (error) {
      console.error(
        `Error fetching ${newspaper.name} articles: ${error.message}`
      );
    }
  }
};

fetchArticles();

app.get("/", (req, res) => {
  res.json("Welcome to my Climate Change News API");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperId", (req, res) => {
  const newspaperId = req.params.newspaperId;
  const newspaper = newspapers.find((np) => np.name === newspaperId);

  if (!newspaper) {
    return res.status(404).json({ error: "Newspaper not found" });
  }

  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text().trim();
        const url = $(this).attr("href");
        let description = $(this).find("p").first().text().trim();

        if (!description) {
          return;
        }

        specificArticles.push({
          title,
          url: newspaper.base + url,
          description,
          source: newspaperId,
        });

        if (specificArticles.length >= 5) {
          return false;
        }
      });
      res.json(specificArticles);
    })
    .catch((err) => {
      console.error(`Error fetching ${newspaperId} articles: ${err.message}`);
      res.status(500).json({ error: "Error fetching news" });
    });
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
