import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "../src/routes/auth.route.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import uploadRouter from "./routes/upload.route.js";

const app = express();

// Middleware
// Use helmet to set various HTTP headers for security
app.use(helmet());
app.use(cookieParser());
// allow from different origins,but only from the specified origin in the environment variable
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies to be sent
  }),
);

app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({
    message: "API is running",
  });
});

export default app;
