import {
  getAllProducts,
  getProductByName,
  getAllProductsWithPaginate,
  createProduct,
  updateProduct,
  deleteProduct,
  getLastFourProducts,
  getProductById,
  getProductsByPriceRange,
} from "../controllers/ProductController.js";
import express from "express";
import upload from "../middleware/Multer.js";
import { paginate } from "../middleware/Pagination.js";
import { authenticate, checkRole } from "../middleware/Auth.js";

const productRouter = express.Router();

productRouter.get("/paginate", paginate, getAllProductsWithPaginate); // any guest can see products
productRouter.get("/", getAllProducts); // any guest can see products
productRouter.get("/last4", getLastFourProducts); // any guest can see products
productRouter.post(
  "/",
  authenticate,
  checkRole(["Admin"]),
  upload.single("image"),
  createProduct
); // only admin can add product
productRouter.patch(
  "/",
  authenticate,
  checkRole(["Admin"]),
  upload.single("image"),
  updateProduct
); // only admin can edit a product
productRouter.delete("/", authenticate, checkRole(["Admin"]), deleteProduct); // only admin can delete a product
productRouter.post("/name", getProductByName); // any guest can filter products
productRouter.post("/id", getProductById); // any guest can filter products
productRouter.post("/price", getProductsByPriceRange); // any guest can filter products

export default productRouter;
