import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { cartController } from "../controller/cart.controller";

const router = Router();
router.route('/get-cart').get(verifyJWT, cartController.getCartByUserId);
router.route("/addToCart/:id").post(verifyJWT, cartController.addToCart);

// both router checked and verified
export default router;