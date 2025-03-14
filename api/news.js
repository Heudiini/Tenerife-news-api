const newspapers = [
  {
    title: "10 Must-Try Restaurants in Santa Cruz de Tenerife",
    url: "https://www.tenerifenews.com/restaurants-in-santa-cruz-de-tenerife/",
    image:
      "https://www.tenerifenews.com/wp-content/uploads/2024/09/restaurants-in-santa-cruz-de-tenerife.jpg",
    source: "tenerife-news",
    date: "2024-03-14", // YYYY-MM-DD
  },
  {
    title: "Spain Tightens Rules on Holiday Rentals in Barcelona and Tenerife",
    url: "https://www.tenerifenews.com/spain-tightens-rules-on-holiday-rentals/",
    image:
      "https://www.tenerifenews.com/wp-content/uploads/2024/09/New-rules-for-Spanish-rentals.jpg",
    source: "tenerife-news",
    date: "2024-03-12",
  },
  {
    title:
      "Tenerife necesitaría 20 veces más cantidad de energías limpias para autoabastecerse con renovables",
    url: "https://planetacanario.com/tenerife-tendria-que-multiplicar-por-20-su-potencia-de-energias-limpias-para-ser-100-renovable/",
    image:
      "https://planetacanario.b-cdn.net/wp-content/themes/jnews/assets/img/jeg-empty.png",
    source: "planeta-canario",
    date: "2024-03-10",
  },
  {
    title:
      "Los cabildos de Tenerife y Gran Canaria garantizan la gratuidad del transporte público en 2025",
    url: "https://planetacanario.com/los-cabildos-de-tenerife-y-gran-canaria-garantizan-la-gratuidad-del-transporte-publico-en-2025/",
    image:
      "https://planetacanario.b-cdn.net/wp-content/themes/jnews/assets/img/jeg-empty.png",
    source: "planeta-canario",
    date: "2024-03-08",
  },
  {
    title: "Maná y Residente actuarán en junio en el ‘Tenerife Music Festival’",
    url: "https://planetacanario.com/mana-y-residente-actuaran-en-junio-en-el-tenerife-music-festival/",
    image:
      "https://planetacanario.b-cdn.net/wp-content/themes/jnews/assets/img/jeg-empty.png",
    source: "planeta-canario",
    date: "2024-03-06",
  },
];

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  res.status(200).json(newspapers);
};
