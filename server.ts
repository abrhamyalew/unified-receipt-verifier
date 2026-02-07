import express from "express";
import type { Express } from "express";
import cors from "cors";
import verifyRoute from "./routes/verify.routes.js";
const app: Express = express();

app.use(express.json());
app.use(cors());

app.use("/api/verify", verifyRoute);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port localhost:${PORT}`);
});
