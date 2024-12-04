import { Router } from "express";
import {authController } from "../controller/user.controller";
import { verifyJWT } from "../middleware/auth.middleware";


const router = Router();
router.route("/register").post(authController.register)
router.route("/login").post(authController.login)
router.route("/logout").post(verifyJWT,authController.logout)
router.route("/updateProfile/:id").post(verifyJWT, authController.updateProfile)
export default router;