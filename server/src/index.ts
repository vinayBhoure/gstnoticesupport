import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ?? 4000;
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:3000";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(cookieParser());

// Razorpay webhook must be registered before express.json() with express.raw()
// Placeholder — wired in Phase 2

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API routes — wired in Phase 2
// app.use("/api/v1", apiRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
