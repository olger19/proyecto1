import express from "express";
import cors from "cors";

import scraper from "./scraper";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ruta base para probar que el servidor está funcionando
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente 🚀");
});


// Ruta del scraping
app.get("/scrape", async (req, res) => {
    try {
        const data = await scraper();
        res.json(data);
    } catch (error) {
        console.error("Error en el scraping:", error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});