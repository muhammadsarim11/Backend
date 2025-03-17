import { Router } from "express";
import RegisterUser from "../controller/user.contoller.js";

const router = Router();

router.route("/register").post(RegisterUser);
export default router;
