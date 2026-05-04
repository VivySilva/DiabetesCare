import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./routes/autenticacao";
import cadastroRoutes from "./routes/cadastro";
import esqueceuSenhaRoutes from "./routes/esqueceu_a_senha";

/**
 * Main Express application instance.
 * Responsible for managing API routes and middlewares.
 */
const app = express();


const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DiabetesCare API",
      version: "1.0.0",
      description: "API para gerenciamento de cuidados com diabetes",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor de desenvolvimento",
      },
    ],
  },
  apis: ["./routes/*.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * Middleware to enable the API to receive and parse
 * incoming requests with JSON payloads.
 */
app.use(express.json());

/**
 * Register API routes.
 */
app.use("/cadastro", cadastroRoutes);
app.use("/autenticacao", authRoutes);
app.use("/esqueceu_a_senha", esqueceuSenhaRoutes);

/**
 * API root route.
 * Used to verify if the server is running correctly (health check).
 * 
 * Method: GET
 * Endpoint: /
 * Returns: Simple API status message
 */
app.get("/", (req, res) => {
    res.send("API DiabetesCare rodando 🚀");
});

/**
 * Initializes the server on port 3001.
 * Logs a message to the console when the API is active.
 */
app.listen(3001, () => {
    console.log("🔥 Servidor rondando na porta 3001 🔥");
});