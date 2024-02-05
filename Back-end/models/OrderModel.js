import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["Initiated", "In Process", "Sent", "Delivered", "Declined"],
      default: "Initiated",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productDetails: {
      type: Object,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
