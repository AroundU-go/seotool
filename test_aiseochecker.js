const url = "https://vebapi.com/api/seo/aiseochecker?website=vebapi.com";
fetch(url, {
  headers: {
    "X-API-KEY": "f1aa74ef-16ff-4713-ae11-ab5cd3523246",
    "Content-Type": "application/json"
  }
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err));
