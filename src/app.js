import express from "express";
const app = express();
import cors from "cors";

app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "process.env.CLIENT_URL",
    credentials: true,
  })
);
app.get("/", function (req, res) {
  res.send("hello jee");
});

import userRouter from "../routes/user.routes.js";
app.use("/api/v1/users", userRouter);

export default app;
