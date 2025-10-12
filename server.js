import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const sitesDir = path.join(__dirname, "sites");
if (!fs.existsSync(sitesDir)) fs.mkdirSync(sitesDir);

// Página inicial (painel)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Criar novo site
app.post("/api/create", (req, res) => {
  const { name, html } = req.body;
  if (!name || !html) return res.status(400).send("Nome e HTML obrigatórios.");

  const folder = path.join(sitesDir, name);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  fs.writeFileSync(path.join(folder, "index.html"), html);
  res.json({ message: "Site criado!", url: `/${name}` });
});

// Listar sites
app.get("/api/list", (req, res) => {
  const sites = fs.readdirSync(sitesDir);
  res.json(sites);
});

// Deletar site
app.delete("/api/delete/:name", (req, res) => {
  const folder = path.join(sitesDir, req.params.name);
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
    res.json({ message: "Site excluído!" });
  } else {
    res.status(404).send("Site não encontrado.");
  }
});

// Servir sites criados
app.get("/:site", (req, res) => {
  const siteFile = path.join(sitesDir, req.params.site, "index.html");
  if (fs.existsSync(siteFile)) res.sendFile(siteFile);
  else res.status(404).send("Site não encontrado.");
});

app.listen(PORT, () => console.log(`🌐 InfinityCloud rodando na porta ${PORT}`));
