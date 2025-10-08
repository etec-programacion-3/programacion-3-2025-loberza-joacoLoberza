import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

//Creamos el proceso de express y el puerto para el servidor.
const app = express();
const PORT = process.env.PORT || 3000;

//Midleware para recibir y enviar JSON.
app.use(express.json())

//Creamos el servidor.
try {
    app.listen(PORT, () => {
        console.log(`Servidor inciado en el puerto ${PORT}...`)
    })
} catch (err) {
    throw new Error(`ERROR:\n  No se ha podido inciar el servidor... - ${err}`)
}