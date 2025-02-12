const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
