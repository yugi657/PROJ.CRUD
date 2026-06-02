// Importando as dependências necessárias
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware para o servidor entender dados no formato JSON
app.use(express.json());
app.use(cors());

// Configuração da conexão com o Banco de Dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'etec123',
    database: 'hospital'
});

// Testando a conexão com o Banco de Dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado com sucesso ao banco de dados MySQL!');
});

// Rota base para testar o servidor
app.get('/', (req, res) => {
    res.send('Servidor do Hospital ETEC rodando com sucesso!');
});

// Rota pra cadastrar pacientes (CREATE)

app.post('/pacientes', (req, res) => {

    const { nome, cpf, telefone, data_nascimento } = req.body; 
    
    const sql = 'INSERT INTO pacientes (nome, cpf, telefone, data_nascimento) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [nome, cpf, telefone, data_nascimento], (err, result) => { 
        if (err) {
            console.error('Erro ao inserir paciente:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar paciente' });
        }
        res.status(201).json({ 
            message: 'Paciente cadastrado com sucesso!', 
            id: result.insertId 
        });
    });
});

// Rota pra listar os pacientes (READ)
app.get('/pacientes', (req, res) => {
    const sql = 'SELECT * FROM pacientes';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar pacientes:', err);
            return res.status(500).json({ error: 'Erro interno no servidor' });
        }
        res.json(results);
    });
});

// Rota para atualizar os dados de um paciente (UPDATE)
app.put('/pacientes/:id', (req, res) => {
    // Pegamos o ID que veio na URL (ex: /pacientes/1)
    const { id } = req.params; 
    // Pegamos os novos dados enviados no corpo da requisição
    const { nome, cpf, telefone, data_nascimento } = req.body;

    const sql = `UPDATE pacientes 
                 SET nome = ?, cpf = ?, telefone = ?, data_nascimento = ? 
                 WHERE id = ?`;

    // O ID entra como o último elemento para preencher a última '?'
    db.query(sql, [nome, cpf, telefone, data_nascimento, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar paciente:', err);
            return res.status(500).json({ error: 'Erro ao atualizar paciente' });
        }
        
        // Verifica se o MySQL realmente encontrou e alterou alguém com esse ID
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Paciente não encontrado' });
        }

        res.json({ message: 'Paciente atualizado com sucesso!' });
    });
});

// Rota para deletar um paciente (DELETE)
app.delete('/pacientes/:id', (req, res) => {
    // Pegamos o ID do paciente que será deletado da URL
    const { id } = req.params;

    const sql = 'DELETE FROM pacientes WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao deletar paciente:', err);
            return res.status(500).json({ error: 'Erro interno ao deletar' });
        }

        // Se nenhuma linha foi afetada, significa que esse ID não existe no banco
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Paciente não encontrado' });
        }

        res.json({ message: 'Paciente deletado com sucesso!' });
    });
});

// Ligando a aplicação na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando perfeitamente na porta ${PORT}`);
});