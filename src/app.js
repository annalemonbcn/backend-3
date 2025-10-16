import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import mocksRouter from "./routes/mocks.router.js";
import petsRouter from "./routes/pets.router.js";
import usersRouter from "./routes/users.router.js";
import adoptionsRouter from "./routes/adoptions.router.js";

const app = express();

const swaggerDocument = YAML.load("./swagger.yaml");

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/mocks", mocksRouter);
app.use("/api/pets", petsRouter);
app.use("/api/users", usersRouter);
app.use("/api/adoptions", adoptionsRouter);

app.use(errorHandler);

export { app };
