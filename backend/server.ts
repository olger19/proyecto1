import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
const PORT = 5000;

app.use(cors()); // Permitir acceso desde React

app.get("/api/scrape", async (req, res) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www.alkhofarsac.com/shop/");

  const title = await page.title();
  const links = await page.$$eval("a", (anchors) =>
    anchors.map((a) => ({ text: a.innerText, href: a.href }))
  );

  await browser.close();
  res.json({ title, links });
});

app.listen(PORT, () => console.log(`Backend en http://localhost:${PORT}`));