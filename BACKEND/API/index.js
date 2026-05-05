require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Movi para cima para organizar
const app = express();

// --- CONFIGURAÇÕES ---
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PATCH, DELETE');
    // No seu index.js, onde configurou o CORS:
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, id-token");
    next();
});

// --- BANCO DE DADOS ---
const mongoString = process.env.MONGO_URI;
mongoose.connect(mongoString); 
const db = mongoose.connection;

db.on('error', (error) => console.log(error));
db.once('connected', () => console.log('Database Connected'));

// --- ROTAS ---
const routes = require('./routes/routes');
app.use('/api', routes);

// --- INICIALIZAÇÃO (APENAS UM LISTEN NO FINAL!) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
});