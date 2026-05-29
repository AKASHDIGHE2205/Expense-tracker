import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/authRoutes.js";
import catgRoutes from "./routes/categoryRoutes.js";
import tranRoutes from "./routes/tranRoutes.js"
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use("/api/auth", userRoutes);
app.use("/api/category", catgRoutes);
app.use("/api/tran", tranRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});