import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'
import path from 'path'
import authRouter from "./router/auth.router.js"
import courseRouter from "./router/course.router.js"
import instructorRouter from "./router/instructor.router.js"
import learnerRouter from "./router/learner.router.js"
import adminRouter from "./router/admin.router.js"
import certificateRouter from "./router/certificate.router.js"

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Reject other origins
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/public", express.static(path.resolve("public")));

app.use("/api/auth", authRouter);
app.use("/api/instructor", instructorRouter);
app.use("/api/learner", learnerRouter);
app.use("/api/course", courseRouter);
app.use("/api/admin", adminRouter)
app.use("/api/certificate", certificateRouter);

export default app;