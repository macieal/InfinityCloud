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

// Arquivo que guarda os donos dos sites
const ownersFile = path.join(sitesDir, "owners.json");

// Garante que o arquivo exista
if (!fs.existsSync(ownersFile)) {
  fs.writeFileSync(ownersFile, JSON.stringify({}));
}

// Função para carregar e salvar donos
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

  // Se já existe e o dono é outro
  if (owners[name] && owners[name] !== userId) {
    return res.status(403).send("❌ Esse nome já pertence a outro usuário!");
  }

  // Se for novo, salva o dono
  owners[name] = userId;
  saveOwners(owners);

  // Cria a pasta e salva o HTML
  const sitePath = path.join(sitesDir, name);
  if (!fs.existsSync(sitePath)) fs.mkdirSync(sitePath);
  fs.writeFileSync(path.join(sitePath, "index.html"), html);

  res.send({ message: "✅ Site criado com sucesso!", url: `/${name}` });
});

// Editar site (só o dono pode)
app.post("/api/edit", (req, res) => {
  const { name, html, userId } = req.body;
  if (!name || !html || !userId) return res.status(400).send("Campos inválidos");

  const owners = getOwners();

  if (!owners[name]) return res.status(404).send("❌ Site não existe!");
  if (owners[name] !== userId) return res.status(403).send("❌ Você não é o dono deste site!");

  const sitePath = path.join(sitesDir, name, "index.html");
  fs.writeFileSync(sitePath, html);

  res.send({ message: "✏️ Site atualizado com sucesso!" });
});

// Deletar site (só o dono pode)
app.post("/api/delete", (req, res) => {
  const { name, userId } = req.body;
  if (!name || !userId) return res.status(400).send("Campos inválidos");

  const owners = getOwners();

  if (!owners[name]) return res.status(404).send("❌ Site não existe!");
  if (owners[name] !== userId) return res.status(403).send("❌ Você não é o dono deste site!");

  const sitePath = path.join(sitesDir, name);
  fs.rmSync(sitePath, { recursive: true, force: true });
  delete owners[name];
  saveOwners(owners);

  res.send({ message: "🗑️ Site deletado com sucesso!" });
});

// Listar sites públicos
app.get("/api/sites", (req, res) => {
  const owners = getOwners();
  res.send(Object.keys(owners));
});

// Servir os sites criados
app.use("/:siteName", (req, res) => {
  const sitePath = path.join(sitesDir, req.params.siteName, "index.html");
  if (fs.existsSync(sitePath)) {
    res.sendFile(sitePath);
  } else {
    res.status(404).send(`<h1>404 - Site não encontrado</h1>`);
  }
});

app.listen(PORT, () => console.log(`🚀 InfinityCloud rodando na porta ${PORT}`));
