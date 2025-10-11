const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const sites = {};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/sites', (req, res) => {
  const { name, html } = req.body;
  
  if (sites[name]) {
    return res.status(400).json({ error: 'Site já existe' });
  }
  
  sites[name] = { html, createdAt: new Date() };
  res.json({ success: true, url: `/${name}` });
});

app.get('/api/sites', (req, res) => {
  res.json(sites);
});

app.delete('/api/sites/:name', (req, res) => {
  const { name } = req.params;
  delete sites[name];
  res.json({ success: true });
});

app.get('/:siteName', (req, res) => {
  const { siteName } = req.params;
  const site = sites[siteName];
  
  if (!site) {
    return res.status(404).send('<h1>Site não encontrado</h1>');
  }
  
  res.send(site.html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`InfinityCloud rodando na porta ${PORT}`);
});