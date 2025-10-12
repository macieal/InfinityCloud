import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();
const sitesDir = path.join(__dirname, "sites");

// garante que a pasta exista
if (!fs.existsSync(sitesDir)) {
  fs.mkdirSync(sitesDir);
}

// configura o multer para uploads temporários
const upload = multer({ dest: "uploads/" });

app.use(express.static("sites"));
app.use(express.static(__dirname));
app.use(bodyParser.text({ type: "text/html" }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// rota para listar sites hospedados
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
      .site-list {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .site-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 320px;
        background: #1e293b;
        padding: 10px 15px;
        border-radius: 8px;
      }
      .delete-btn {
        background: #ef4444;
        border: none;
        color: white;
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
      }
      .delete-btn:hover { opacity: 0.9; }
      button.back {
        margin-top: 30px;
        padding: 10px 18px;
        border: none;
        border-radius: 10px;
        background: #6ee7b7;
        color: #0f172a;
        font-weight: bold;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <h1>🌐 Sites hospedados</h1>
    <div class="site-list">`;

  if (sites.length === 0) {
    html += "<p>Nenhum site foi hospedado ainda 😅</p>";
  } else {
    sites.forEach(site => {
      html += `
        <div class="site-item">
          <a href="/${site}" target="_blank">${site}</a>
          <button class="delete-btn" onclick="fetch('/delete/${site}', {method: 'DELETE'}).then(()=>location.reload())">🗑️</button>
        </div>
      `;
    });
  }

  html += `
    </div>
    <button class="back" onclick="window.location.href='/'">⬅️ Voltar</button>
  </body>
  </html>`;

  res.send(html);
});

// rota para deletar site
app.delete("/delete/:name", (req, res) => {
  const siteName = req.params.name;
  const sitePath = path.join(sitesDir, siteName);

  if (fs.existsSync(sitePath)) {
    fs.rmSync(sitePath, { recursive: true, force: true });
    return res.send("✅ Site deletado com sucesso!");
  }

  res.status(404).send("❌ Site não encontrado!");
});

// rota para criar site (HTML + arquivos)
app.post("/create", upload.array("files"), (req, res) => {
  const siteName = req.body.name;
  const html = req.body.html;
  if (!siteName || !html) {
    return res.status(400).send("❌ Faltando nome ou HTML!");
  }

  const sitePath = path.join(sitesDir, siteName);
  if (!fs.existsSync(sitePath)) {
    fs.mkdirSync(sitePath);
  }

  // salva o HTML principal
  fs.writeFileSync(path.join(sitePath, "index.html"), html);

  // salva arquivos enviados
  if (req.files) {
    req.files.forEach(file => {
      const destPath = path.join(sitePath, file.originalname);
      fs.renameSync(file.path, destPath);
    });
  }

  res.send("✅ Site criado com sucesso!");
});

app.listen(PORT, () => {
  console.log(`🚀 InfinityCloud rodando em http://localhost:${PORT}`);
});
