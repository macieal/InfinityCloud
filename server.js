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
    `✅ Site criado com sucesso!<br><a href="/${siteName}" target="_blank">Acessar site</a>`
  );
});

app.listen(PORT, () => {
  console.log(`🚀 InfinityCloud rodando em http://localhost:${PORT}`);
});
