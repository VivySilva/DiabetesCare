import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./routes/auth";
import registerRoutes from "./routes/register";
import forgotPasswordRoutes from "./routes/forgot_password";
import glucoseRecordRoutes from "./routes/glucose_record";
import medicationRecordRoutes from "./routes/medication_record";
import communityPostRoutes from "./routes/community_post";
import forumRoutes from "./routes/forum";
import notificationRoutes from "./routes/notification";
import userRoutes from "./routes/user";

/**
 * Main Express application instance.
 * Responsible for managing API routes and middlewares.
 */
const app = express();

/**
 * Middleware to enable Cross-Origin Resource Sharing (CORS).
 */
app.use(cors());

/**
 * Swagger configuration for API documentation.
 * Generates interactive API docs at /api-docs endpoint.
 * 
 * @constant {Object} swaggerOptions
 * @property {Object} definition - OpenAPI specification version and info
 * @property {string[]} apis - Path patterns for route files to document
 */
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Register API routes.
 */
app.use("/register", registerRoutes);
app.use("/auth", authRoutes);
app.use("/forgot_password", forgotPasswordRoutes);
app.use("/glucose_record", glucoseRecordRoutes);
app.use("/medication_record", medicationRecordRoutes);
app.use("/community_post", communityPostRoutes);
app.use("/forum", forumRoutes);
app.use("/notification", notificationRoutes);
app.use("/user", userRoutes);

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
    console.log("🔥 Servidor rodando na porta 3001 🔥");
});