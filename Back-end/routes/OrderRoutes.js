import {
  addOrder,
  editOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
} from "../controllers/OrderController.js";
import express from "express";
import { authenticate, checkRole } from "../middleware/Auth.js";

const orderRouter = express.Router();

orderRouter.post("/", authenticate, checkRole(["Customer"]), addOrder); // only a user can add an order
orderRouter.patch("/", authenticate, checkRole(["Admin"]), editOrder); // only an admin can edit the status of an order
orderRouter.delete("/", authenticate, checkRole(["Admin"]), deleteOrder); // only admin can delete an order
orderRouter.get("/", authenticate, checkRole(["Admin"]), getAllOrders); // only admin can see orders
orderRouter.post("/byId", authenticate, checkRole(["Admin"]), getOrderById); // only admin can get order by id

export default orderRouter;
