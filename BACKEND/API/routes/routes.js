const express = require('express');
const router = express.Router();
const modeloTarefa = require('../models/tarefa');
const userModel = require('../models/user');
var jwt = require('jsonwebtoken'); // Importe o JWT aqui em cima

// ==========================================
// 1. FUNÇÕES DE AUTORIZAÇÃO (Sempre no topo!)
// ==========================================

function verificaJWT(req, res, next) {
    // O cabeçalho que vem do Postman/Angular deve ser 'id-token'
    const token = req.headers['id-token']; 
    
    if (!token) return res.status(401).json({
        auth: false, message: 'Token nao fornecido'
    });

    jwt.verify(token, 'segredo', function (err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Falha !' });
        
        req.userId = decoded.id; // Salva o ID do usuário para uso na rota
        next();
    });
}

// ==========================================
// 2. ROTAS PROTEGIDAS
// ==========================================

// GET protegido - Lista todas as tarefas
router.get('/getAll', verificaJWT, async (req, res) => {
    try {
        const resultados = await modeloTarefa.find();
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST protegido - Cria nova tarefa
router.post('/post', verificaJWT, async (req, res) => {
    const objetoTarefa = new modeloTarefa({
        descricao: req.body.descricao,
        statusRealizada: req.body.statusRealizada
    });
    try {
        const tarefaSalva = await objetoTarefa.save();
        res.status(200).json(tarefaSalva);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE protegido
router.delete('/delete/:id', verificaJWT, async (req, res) => {
    try {
        const resultado = await modeloTarefa.findByIdAndDelete(req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE (PATCH) protegido
router.patch('/update/:id', verificaJWT, async (req, res) => {
    try {
        const id = req.params.id;
        const novaTarefa = req.body;
        const result = await modeloTarefa.findByIdAndUpdate(id, novaTarefa, { new: true });
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ==========================================
// 3. LOGIN (Aberta ao público)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        // Ele vai no MongoDB buscar um usuário com o nome digitado
        const data = await userModel.findOne({ 'nome': req.body.nome });
console.log("Usuário encontrado no banco:", data);
        // Se achou o usuário E a senha do banco for igual à digitada...
        if (data != null && data.senha === req.body.senha) {
           const token = jwt.sign({ id: data._id.toString() }, 'segredo', { expiresIn: 300 });
            return res.json({ token: token });
        }
        
        // Se o nome não existir ou a senha estiver errada
        res.status(500).json({ message: 'Login invalido!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;