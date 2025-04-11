import { Router } from "express";
import RegisterUser from "../controller/user.contoller.js";
import uploadFields from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(uploadFields, RegisterUser);
export default router;
