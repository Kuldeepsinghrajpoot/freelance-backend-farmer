import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { orderController } from "../controller/order.controller";
import { upload } from "../middleware/multer.middleware";

const router = Router();
router.route("/orderProudct").post(verifyJWT, orderController.createOrder);
router.route("/getOrder").post(verifyJWT, orderController.getOrders);
router.route("/updateOrderStatus").post(upload.fields([
    { name: 'image', maxCount: 1 },
]),verifyJWT, orderController.updateOrderStatus);

// checked
export default router;