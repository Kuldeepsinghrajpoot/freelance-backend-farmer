import { Router } from "express";
import { productController } from "../controller/prouduct.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();
router.route('/product').get(productController.getProducts);
router.route("/upload-product").post(verifyJWT,productController.uploadProduct)
router.route("/update-product/:id").put(verifyJWT,productController.updateProduct)
router.route("/delete-proudct/:id").put(verifyJWT,productController.deleteProduct)
export default router;