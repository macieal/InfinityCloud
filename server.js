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

const ownersFile = path.join(sitesDir, "owners.json");
if (!fs.existsSync(ownersFile)) fs.writeFileSync(ownersFile, JSON.stringify({}));

function getOwners() {
  return JSON.parse(fs.readFileSync(ownersFile, "utf-8"));
}
function saveOwners(owners) {
  fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));
}

// Criar site
app.post("/api/create", (req, res) => {
  const { name, html, userId } = req.body;
  if (!name || !html || !userId) return res.status(400).send("Campos inválidos");

  const owners = getOwners();
  if (owners[name] && owners[name] !== userId)
    return res.status(403).send("❌ Esse nome já pertence a outro usuário!");

  owners[name] = userId;
  saveOwners(owners);

  const sitePath = path.join(sitesDir, name);
  if (!fs.existsSync(sitePath)) fs.mkdirSync(sitePath);
  fs.writeFileSync(path.join(sitePath, "index.html"), html);

  res.json({ message: "✅ Site criado com sucesso!", url: `/${name}` });
});

// Listar sites públicos
app.get("/api/sites", (req, res) => {
  const owners = getOwners();
  res.json(Object.keys(owners));
});

// Servir sites criados
app.get("/:siteName", (req, res) => {
  const sitePath = path.join(sitesDir, req.params.siteName, "index.html");
  if (fs.existsSync(sitePath)) res.sendFile(sitePath);
  else res.status(404).send("<h1>404 - Site não encontrado</h1>");
});

app.listen(PORT, () =>
  console.log(`🚀 InfinityCloud rodando em http://localhost:${PORT}`)
);