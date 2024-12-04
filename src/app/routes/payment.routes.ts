import { Router } from "express";
import { paymentController } from "../controller/payment.controller";

const router = Router();
router.route('/payment').get(paymentController.createOrder);

export default router;