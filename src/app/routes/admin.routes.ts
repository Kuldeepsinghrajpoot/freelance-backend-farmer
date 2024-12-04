import { Router } from "express";
import { adminController } from "../controller/admin.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route('/register').post(adminController.register)
router.route('/login').post(verifyJWT, adminController.login)
router.route('/update/:id').post(verifyJWT,adminController.updateProfile)


export default router