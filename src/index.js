
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import  connectDB  from "../db/db.js";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

connectDB();

