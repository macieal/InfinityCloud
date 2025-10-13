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

const dbFile = path.join(sitesDir, "db.json");
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "{}");

const getDB = () => JSON.parse(fs.readFileSync(dbFile, "utf8"));
const saveDB = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));

app.post("/api/create", (req, res) => {
  const { name, html, userId, editing, publish } = req.body;
  if (!name || !html || !userId) return res.status(400).send("Dados inválidos.");
  const db = getDB();

  const folder = path.join(sitesDir, userId);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);
  const siteFolder = path.join(folder, name);
  if (!fs.existsSync(siteFolder)) fs.mkdirSync(siteFolder);
  fs.writeFileSync(path.join(siteFolder, "index.html"), html);

  db[name] = { owner: userId, updated: Date.now(), public: publish };
  saveDB(db);
  res.json({ ok: true });
});

app.get("/api/list/:userId", (req, res) => {
  const { userId } = req.params;
  const db = getDB();
  const sites = Object.entries(db)
    .filter(([_, v]) => v.owner === userId)
    .map(([name, v]) => ({ name, owner: v.owner }));
  res.json(sites);
});

app.get("/api/community", (req, res) => {
  const db = getDB();
  const sites = Object.entries(db)
    .filter(([_, v]) => v.public)
    .map(([name, v]) => ({ name, owner: v.owner }));
  res.json(sites);
});

app.get("/api/get/:name", (req, res) => {
  const { name } = req.params;
  const { user } = req.query;
  const db = getDB();
  if (!db[name] || db[name].owner !== user)
    return res.status(403).send("Sem permissão.");
  const file = path.join(sitesDir, user, name, "index.html");
  if (!fs.existsSync(file)) return res.status(404).send("Não encontrado.");
  const html = fs.readFileSync(file, "utf8");
  res.json({ html, public: db[name].public });
});

app.delete("/api/delete/:name", (req, res) => {
  const { name } = req.params;
  const { user } = req.query;
  const db = getDB();
  if (!db[name] || db[name].owner !== user)
    return res.status(403).send("Sem permissão.");
  const folder = path.join(sitesDir, user, name);
  if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });
  delete db[name];
  saveDB(db);
  res.json({ message: "Excluído!" });
});

app.get("/:site", (req, res) => {
  const db = getDB();
  const name = req.params.site;
  if (!db[name]) return res.status(404).send("Site não encontrado.");
  const siteFile = path.join(sitesDir, db[name].owner, name, "index.html");
  if (fs.existsSync(siteFile)) res.sendFile(siteFile);
  else res.status(404).send("Não encontrado.");
});

app.listen(PORT, () => console.log(`🌐 InfinityCloud rodando na porta ${PORT}`));
