import { Router } from "express";
import { paymentController } from "../controller/payment.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();
router.route('/payment').get(verifyJWT, paymentController.createOrder);

export default router;