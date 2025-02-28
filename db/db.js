import mongoose from "mongoose";
import { DB_NAME } from "../src/constant.js";
 const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        console.log("Connected to the database");
        console.log(`Database Name: ${connectionInstance.connection.host}`);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default connectDB;