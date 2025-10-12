import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
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
app.use(express.static(__dirname));

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔥 Listar sites hospedados
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
      .site {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 300px;
        background: #1e293b;
        padding: 10px 15px;
        border-radius: 10px;
        margin-top: 8px;
      }
      a {
        color: #6ee7b7;
        text-decoration: none;
        font-weight: 600;
      }
      a:hover { text-decoration: underline; }
      button {
        background: #ef4444;
        border: none;
        color: white;
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
      }
      button:hover { opacity: 0.8; }
      .back {
        margin-top: 25px;
        background: #6ee7b7;
        color: #0f172a;
        padding: 8px 15px;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <h1>🌐 Sites hospedados</h1>
  `;

  if (sites.length === 0) {
    html += "<p>Nenhum site foi hospedado ainda 😅</p>";
  } else {
    sites.forEach(site => {
      html += `
        <div class="site">
          <a href="/${site}" target="_blank">${site}</a>
          <form method="POST" action="/delete/${site}" onsubmit="return confirm('Tem certeza que deseja deletar ${site}?')">
            <button>🗑️</button>
          </form>
        </div>
      `;
    });
  }

  html += `
    <a href="/" class="back">⬅️ Voltar</a>
  </body>
  </html>
  `;

  res.send(html);
});

// 🔥 Criar novo site
app.post("/create", (req, res) => {
  const siteName = req.query.name;
  const html = req.body || "<h1>Site vazio criado!</h1>";

  if (!siteName) {
    return res.status(400).send("Erro: forneça um nome ?name=nomedosite");
  }

  const sitePath = path.join(sitesDir, siteName);
  if (!fs.existsSync(sitePath)) fs.mkdirSync(sitePath);

  fs.writeFileSync(path.join(sitePath, "index.html"), html);
  res.send(`✅ Site criado! <a href="/${siteName}" target="_blank">Abrir</a>`);
});

// 🔥 Upload de arquivos extras
app.post("/upload/:name", upload.single("file"), (req, res) => {
  const siteName = req.params.name;
  const sitePath = path.join(sitesDir, siteName);

  if (!fs.existsSync(sitePath)) {
    return res.status(404).send("Site não encontrado!");
  }

  const file = req.file;
  const destPath = path.join(sitePath, file.originalname);
  fs.renameSync(file.path, destPath);

  res.redirect(`/list`);
});

// 🔥 Deletar site
app.post("/delete/:name", (req, res) => {
  const siteName = req.params.name;
  const sitePath = path.join(sitesDir, siteName);
  if (fs.existsSync(sitePath)) {
    fs.rmSync(sitePath, { recursive: true });
  }
  res.redirect("/list");
});

app.listen(PORT, () => {
  console.log(`🚀 InfinityCloud rodando em http://localhost:${PORT}`);
});