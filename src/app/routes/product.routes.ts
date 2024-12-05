import { Router } from "express";
import { productController } from "../controller/prouduct.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { upload } from "../middleware/multer.middleware";

const router = Router();
router.route('/product').get(productController.getProducts);
router.route("/upload-product").post(verifyJWT, upload.fields([
    { name: 'image', maxCount: 1 },
]), productController.uploadProduct) // checked
router.route("/get-product").get(verifyJWT, productController.getProducts) // checked
router.route("/update-product/:id").put(verifyJWT, upload.fields([
    { name: 'image', maxCount: 1 },
]), productController.updateProduct) // checked
router.route("/delete-proudct/:id").delete(verifyJWT, productController.deleteProduct)
export default router;