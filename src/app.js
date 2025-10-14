import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import mocksRouter from "./routes/mocks.router.js";
import petsRouter from "./routes/pets.router.js";
import usersRouter from "./routes/users.router.js";
import adoptionsRouter from "./routes/adoptions.router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const swaggerDocument = YAML.load("./swagger.yaml");

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/mocks", mocksRouter);
app.use("/api/pets", petsRouter);
app.use("/api/users", usersRouter);
app.use("/api/adoptions", adoptionsRouter);

app.use(errorHandler);

const startServer = async () => {
  await connectToDatabase();
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
};

await startServer();
