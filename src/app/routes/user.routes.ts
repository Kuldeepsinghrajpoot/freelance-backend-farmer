import { Router } from "express";
import { authController } from "../controller/user.controller";
import { verifyJWT } from "../middleware/auth.middleware";


const router = Router();
router.route("/register").post(authController.register)
router.route("/login").post(authController.login)
router.route("/logout").post(verifyJWT, authController.logout)
router.route("/updateProfile").put(verifyJWT, authController.updateProfile)
router.route("/updatePassword").put(verifyJWT, authController.updatePassword)
router.route('/get-profile').get(verifyJWT, authController.getProfile)
export default router;