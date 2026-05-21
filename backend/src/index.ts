import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import { createHttpServer } from "./socket.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      config.corsOrigins.length > 1 ? config.corsOrigins : config.corsOrigins[0],
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", routes);

app.use(errorHandler);

const httpServer = createHttpServer(app);

httpServer.listen(config.PORT, () => {
  console.log(`knode-backend listening on port ${config.PORT}`);
});
