import express from "express";

/**
 * Instância principal da aplicação Express.
 * Responsável por gerenciar rotas e middlewares da API.
 */
const app = express();

/**
 * Middleware para permitir que a API receba e interprete
 * requisições com corpo em formato JSON.
 */
app.use(express.json());

/**
 * Rota raiz da API.
 * Utilizada para verificar se o servidor está funcionando corretamente.
 * 
 * Método: GET
 * Endpoint: /
 * Retorno: Mensagem simples de status da API
 */
app.get("/", (req, res) => {
    res.send("API DiabetesCare rodando 🚀");
});

/**
 * Inicializa o servidor na porta 3001.
 * Exibe uma mensagem no console quando a API está ativa.
 */
app.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});