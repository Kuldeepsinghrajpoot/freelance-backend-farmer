import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { cartController } from "../controller/cart.controller";

const router = Router();
router.route('/cart').get(verifyJWT, cartController.getCartByUserId);

export default router;