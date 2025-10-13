import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" }));

// Pasta onde os sites vão ser salvos
const sitesDir = path.join(__dirname, "sites");
if (!fs.existsSync(sitesDir)) fs.mkdirSync(sitesDir);

const sitesFile = path.join(sitesDir, "sites.json");

// Cria o arquivo se não existir
if (!fs.existsSync(sitesFile)) {
  fs.writeFileSync(sitesFile, JSON.stringify([]));
}

// Funções de leitura e gravação
function getSites() {
  return JSON.parse(fs.readFileSync(sitesFile, "utf8"));
}
function saveSites(data) {
  fs.writeFileSync(sitesFile, JSON.stringify(data, null, 2));
}

// Criar novo site
app.post("/api/create", (req, res) => {
  const { name, html, userId, publishCommunity } = req.body;
  if (!name || !html || !userId)
    return res.status(400).json({ error: "Campos inválidos" });

  const sites = getSites();

  // Se o nome já existir, não deixa criar
  if (sites.some((s) => s.name === name)) {
    return res
      .status(400)
      .json({ error: "❌ Já existe um site com esse nome!" });
  }

  const newSite = {
    name,
    owner: userId,
    html,
    community: !!publishCommunity,
  };

  // Salva o arquivo físico
  const folder = path.join(sitesDir, name);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  fs.writeFileSync(path.join(folder, "index.html"), html);

  // Atualiza o JSON
  sites.push(newSite);
  saveSites(sites);

  res.json({ message: "✅ Site criado com sucesso!", url: `/${name}` });
});

// Lista de sites da comunidade
app.get("/api/community", (req, res) => {
  const sites = getSites().filter((s) => s.community);
  res.json(sites.map((s) => s.name));
});

// Servir os sites criados
app.get("/:siteName", (req, res) => {
  const sitePath = path.join(sitesDir, req.params.siteName, "index.html");
  if (fs.existsSync(sitePath)) {
    res.sendFile(sitePath);
  } else {
    res.status(404).send("<h1>404 - Site não encontrado</h1>");
  }
});

app.listen(PORT, () =>
  console.log(`🚀 InfinityCloud rodando em http://localhost:${PORT}`)
);
