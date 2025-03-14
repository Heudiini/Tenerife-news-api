// api/news.js
const express = require("express");
const router = express.Router();

const newspapers = [
  {
    title: "10 Must-Try Restaurants in Santa Cruz de Tenerife",
    url: "https://www.tenerifenews.com/restaurants-in-santa-cruz-de-tenerife/",
    image:
      "https://www.tenerifenews.com/wp-content/uploads/2024/09/restaurants-in-santa-cruz-de-tenerife.jpg",
    source: "tenerife-news",
  },
  {
    title: "Spain Tightens Rules on Holiday Rentals in Barcelona and Tenerife",
    url: "https://www.tenerifenews.com/spain-tightens-rules-on-holiday-rentals/",
    image:
      "https://www.tenerifenews.com/wp-content/uploads/2024/09/New-rules-for-Spanish-rentals.jpg",
    source: "tenerife-news",
  },
  {
    title:
      "Tenerife necesitaría 20 veces más cantidad de energías limpias para autoabastecerse con renovables",
    url: "https://planetacanario.com/tenerife-tendria-que-multiplicar-por-20-su-potencia-de-energias-limpias-para-ser-100-renovable/",
    image:
      "https://planetacanario.b-cdn.net/wp-content/themes/jnews/assets/img/jeg-empty.png",
    source: "planeta-canario",
  },
  {
    title:
      "Los cabildos de Tenerife y Gran Canaria garantizan la gratuidad del transporte público en 2025",
    url: "https://planetacanario.com/los-cabildos-de-tenerife-y-gran-canaria-garantizan-la-gratuidad-del-transporte-publico-en-2025/",
    image:
      "https://planetacanario.b-cdn.net/wp-content/themes/jnews/assets/img/jeg-empty.png",
    source: "planeta-canario",
  },
  {
    title: "Maná y Residente actuarán en junio en el ‘Tenerife Music Festival’",
    url: "https://planetacanario.com/mana-y-residente-actuaran-en-junio-en-el-tenerife-music-festival/",
    image:
      "https://planetacanario.b-cdn.net/wp-content/themes/jnews/assets/img/jeg-empty.png",
    source: "planeta-canario",
  },
  {
    title:
      "«Ya no hay excusas para denegar que la momia guanche del Museo Arqueológico Nacional vuelva a Tenerife»",
    url: "https://planetacanario.com/no-hay-excusas-para-que-la-momia-guanche-del-museo-arqueologico-nacional-vuelva-a-tenerife/",
    image:
      "https://planetacanario.b-cdn.net/wp-content/themes/jnews/assets/img/jeg-empty.png",
    source: "planeta-canario",
  },
];

router.get("/news", (req, res) => {
  res.json(newspapers);
});

module.exports = router;
