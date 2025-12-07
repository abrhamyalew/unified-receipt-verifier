import express from "express";
import cors from "cors";
import verifyController from "./controllers/verifyController.js";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/api/verify", verifyController);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port localhost:${PORT}`);
});
