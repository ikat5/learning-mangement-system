import express from 'express' 
import cors from "cors"
import cookieParser from 'cookie-parser'
import path from 'path'
import authRouter from "./router/auth.router.js"
import courseRouter from "./router/course.router.js"
import instructorRouter from "./router/instructor.router.js"
import learnerRouter from "./router/learner.router.js"
import adminRouter from "./router/admin.router.js"

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
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
app.use("/api/admin",adminRouter)

export default app;