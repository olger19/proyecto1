import express from "express";
import cors from "cors";

import scraper from "./scraper";
import pool from "./db";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// Ruta base pra probar que el servidor esta funcionado
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente 🚀");
});


// Ruta de scraping api y correrla y guardarla en la base de datos y obtener informacion
app.get("/scrape", async (req, res) => {
    try {
        const data = await scraper();
        res.json(data);
    } catch (error) {
        console.error("Error en el scraping:", error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
});

// Ruta para poder obtener todos los productos desde la base de datos y mostrarla
app.get("/productos", async (req, res) => {
    try{
        const { rows } = await pool.query("SELECT * FROM productos");
        res.json(rows);
    } catch ( error ){
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener los  productos" });
    }
});



app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
})