const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PATCH, DELETE');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(express.json());

const PORT = process.env.PORT || 3000;
const routes = require('./routes/routes');
app.use('/api', routes);
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})

// --- MUDANÇA AQUI ---
// Em vez de pegar do terminal (process.argv), vamos fixar a string 
// que não usa o "+srv" para evitar o erro ECONNREFUSED
// No seu arquivo index.js (BACKEND/API)
const mongoURL = "mongodb://maria256681:senha1234@ac-rjopdov-shard-00-00.1rcfcot.mongodb.net:27017,ac-rjopdov-shard-00-01.1rcfcot.mongodb.net:27017,ac-rjopdov-shard-00-02.1rcfcot.mongodb.net:27017/tarefasDB?ssl=true&replicaSet=atlas-w015t6-shard-0&authSource=admin&appName=negocioai";

// Configurando a conexao com o Banco de Dados
var mongoose = require('mongoose');
mongoose.connect(mongoURL); 
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on('error', (error) => {
    console.log(error)
})

db.once('connected', () => {
    console.log('Database Connected');
})