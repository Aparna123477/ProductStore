import express from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controller/productController.js";

const router = express.Router();

router.get("/", ensureAuthenticated, getProducts);
router.post("/", ensureAuthenticated, createProduct);
router.put("/:id", ensureAuthenticated, updateProduct);
router.delete("/:id", ensureAuthenticated, deleteProduct);

export default router;