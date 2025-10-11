import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();
const sitesDir = path.join(__dirname, "sites");

if (!fs.existsSync(sitesDir)) {
  fs.mkdirSync(sitesDir);
}

app.use(bodyParser.text({ type: "text/html" }));
app.use(express.static("sites"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔥 Rota que lista todos os sites hospedados
app.get("/list", (req, res) => {
  const sites = fs.readdirSync(sitesDir).filter(file => {
    return fs.lstatSync(path.join(sitesDir, file)).isDirectory();
  });

  let html = `
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Sites hospedados - InfinityCloud</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
      }
      h1 { color: #6ee7b7; }
      a {
        color: #6ee7b7;
        text-decoration: none;
        font-weight: 600;
      }
      a:hover { text-decoration: underline; }
      .site-list {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      button {
        margin-top: 20px;
        padding: 10px 18px;
        border: none;
        border-radius: 10px;
        background: #6ee7b7;
        color: #0f172a;
        font-weight: bold;
        cursor: pointer;
      }
      button:hover { opacity: 0.9; }
    </style>
  </head>
  <body>
    <h1>🌐 Sites hospedados</h1>
    <div class="site-list">
  `;

  if (sites.length === 0) {
    html += "<p>Nenhum site foi hospedado ainda 😅</p>";
  } else {
    sites.forEach(site => {
      html += `<a href="/${site}" target="_blank">🔗 ${site}</a>`;
    });
  }

  html += `
    </div>
    <button onclick="window.location.href='/'">⬅️ Voltar</button>
  </body>
  </html>
  `;

  res.send(html);
});

app.post("/create", (req, res) => {
  const siteName = req.query.name;
  const html = req.body;

  if (!siteName) {
    return res.status(400).send("Erro: forneça um nome ?name=nomedosite");
  }

  const sitePath = path.join(sitesDir, siteName);

  if (!fs.existsSync(sitePath)) {
    fs.mkdirSync(sitePath);
  }

  fs.writeFileSync(path.join(sitePath, "index.html"), html);

  res.send(
    `✅ Site criado com sucesso!<br><a href="/${siteName}" target="_blank">Acessar site</a><br><br><a href="/list">Ver todos os sites</a>`
  );
});

app.listen(PORT, () => {
  console.log(`🚀 InfinityCloud rodando em http://localhost:${PORT}`);
});
