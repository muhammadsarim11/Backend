import { Router } from "express";
import RegisterUser, {
  LoginUser,
  LogoutUser,
} from "../controller/user.contoller.js";
import uploadFields from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controller/user.contoller.js";
const router = Router();

router.route("/register").post(uploadFields, RegisterUser);

router.route("/login").post(LoginUser);

router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/refresh").post(refreshAccessToken);
export default router;
