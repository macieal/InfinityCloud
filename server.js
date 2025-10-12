import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Pasta pública com o painel principal
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" }));

// Caminho onde os sites criados vão ser salvos
const sitesDir = path.join(__dirname, "sites");
if (!fs.existsSync(sitesDir)) fs.mkdirSync(sitesDir);

// Rota principal (painel InfinityCloud)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota pra criar sites via POST
app.post("/api/create", (req, res) => {
  const { name, html } = req.body;
  if (!name || !html) return res.status(400).send("Nome e HTML obrigatórios");

  const sitePath = path.join(sitesDir, name);
  if (!fs.existsSync(sitePath)) fs.mkdirSync(sitePath);

  fs.writeFileSync(path.join(sitePath, "index.html"), html);
  res.send({ message: "Site criado com sucesso!", url: `/` + name });
});

// Servir sites criados (tipo https://infinitycloud.onrender.com/nome)
app.use("/:siteName", (req, res, next) => {
  const sitePath = path.join(sitesDir, req.params.siteName, "index.html");
  if (fs.existsSync(sitePath)) {
    res.sendFile(sitePath);
  } else {
    res.status(404).send(`<h1>404 - Site não encontrado</h1>`);
  }
});

app.listen(PORT, () => console.log(`🚀 InfinityCloud rodando na porta ${PORT}`));
