
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import  connectDB  from "../db/db.js";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

connectDB()
  .then(()=>{
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
})
.catch((err)=>{
  console.log(err);
})
