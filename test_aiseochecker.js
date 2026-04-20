const url = "https://vebapi.com/api/seo/aiseochecker?website=vebapi.com";
fetch(url, {
  headers: {
    "X-API-KEY": "059f4e4e-2479-4f57-af3e-e64f69e8c4e7",
    "Content-Type": "application/json"
  }
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err));
