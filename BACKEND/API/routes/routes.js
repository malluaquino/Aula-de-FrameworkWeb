const express = require('express');
const router = express.Router();
const modeloTarefa = require('../models/tarefa');
var jwt = require('jsonwebtoken'); // Importe o JWT aqui em cima

// ==========================================
// 1. FUNÇÕES DE AUTORIZAÇÃO (Sempre no topo!)
// ==========================================

function verificaJWT(req, res, next) {
    const token = req.headers['id-token']; // O Angular envia exatamente este nome
    
    if (!token) return res.status(401).json({
        auth: false, message: 'Token nao fornecido'
    });

    jwt.verify(token, 'segredo', function (err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Falha !' });
        
        // Se o token for válido, ele deixa passar para a rota
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
router.post('/login', (req, res) => {
    if (req.body.nome === 'branqs' && req.body.senha === '1234') {
        // Gera o token que expira em 5 minutos
        const token = jwt.sign({ id: req.body.nome }, 'segredo', { expiresIn: 300 });
        return res.json({ auth: true, token: token });
    }
    res.status(500).json({ message: 'Login invalido!' });
});

module.exports = router;