import express from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import { createProduct, deleteProduct, getProducts, updateProduct ,aiDescription,assistantChat,getProductById, getSimilarProducts} from "../controller/productController.js";

const router = express.Router();

router.get("/", ensureAuthenticated, getProducts);
router.post("/", ensureAuthenticated, createProduct);
router.put("/:id", ensureAuthenticated, updateProduct);
router.delete("/:id", ensureAuthenticated, deleteProduct);
router.post("/generate-description", ensureAuthenticated, aiDescription);
router.post("/assistant", ensureAuthenticated, assistantChat);
router.get("/:id", ensureAuthenticated, getProductById);
router.get("/:id/similar", ensureAuthenticated, getSimilarProducts);

export default router;