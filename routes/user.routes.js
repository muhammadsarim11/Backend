import { Router } from "express";
import RegisterUser, {
  LoginUser,
  LogoutUser,
} from "../controller/user.contoller.js";
import uploadFields from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(uploadFields, RegisterUser);

router.route("/login").post(LoginUser);

router.route("/logout").post(verifyJWT, LogoutUser);
export default router;
