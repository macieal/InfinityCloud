import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" }));

const sitesDir = path.join(__dirname, "sites");
if (!fs.existsSync(sitesDir)) fs.mkdirSync(sitesDir);

const sitesFile = path.join(sitesDir, "sites.json");
if (!fs.existsSync(sitesFile)) fs.writeFileSync(sitesFile, JSON.stringify([]));

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

  const folder = path.join(sitesDir, name);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  fs.writeFileSync(path.join(folder, "index.html"), html);

  sites.push(newSite);
  saveSites(sites);

  res.json({ message: "✅ Site criado com sucesso!", url: `/${name}` });
});

// Editar site
app.post("/api/edit", (req, res) => {
  const { name, html, userId } = req.body;
  if (!name || !html || !userId)
    return res.status(400).json({ error: "Campos inválidos" });

  const sites = getSites();
  const site = sites.find((s) => s.name === name);

  if (!site) return res.status(404).json({ error: "Site não encontrado!" });
  if (site.owner !== userId)
    return res.status(403).json({ error: "❌ Você não é o dono!" });

  site.html = html;
  const sitePath = path.join(sitesDir, name, "index.html");
  fs.writeFileSync(sitePath, html);

  saveSites(sites);
  res.json({ message: "✏️ Site atualizado com sucesso!" });
});

// Deletar site
app.post("/api/delete", (req, res) => {
  const { name, userId } = req.body;
  if (!name || !userId)
    return res.status(400).json({ error: "Campos inválidos" });

  let sites = getSites();
  const site = sites.find((s) => s.name === name);

  if (!site) return res.status(404).json({ error: "Site não encontrado!" });
  if (site.owner !== userId)
    return res.status(403).json({ error: "❌ Você não é o dono!" });

  sites = sites.filter((s) => s.name !== name);
  saveSites(sites);

  const folder = path.join(sitesDir, name);
  fs.rmSync(folder, { recursive: true, force: true });

  res.json({ message: "🗑️ Site deletado com sucesso!" });
});

// Listar sites
app.get("/api/community", (req, res) => {
  const sites = getSites().filter((s) => s.community);
  res.json(sites);
});
app.get("/api/mysites/:userId", (req, res) => {
  const sites = getSites().filter((s) => s.owner === req.params.userId);
  res.json(sites);
});

// Servir os sites
app.get("/:siteName", (req, res) => {
  const sitePath = path.join(sitesDir, req.params.siteName, "index.html");
  if (fs.existsSync(sitePath)) res.sendFile(sitePath);
  else res.status(404).send("<h1>404 - Site não encontrado</h1>");
});

app.listen(PORT, () =>
  console.log(`🚀 InfinityCloud rodando em http://localhost:${PORT}`)
);
