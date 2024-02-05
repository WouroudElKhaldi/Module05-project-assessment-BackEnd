import Order from "../models/OrderModel.js";
import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";

export const addOrder = async (req, res) => {
  const { userId, productDetails } = req.body;

  try {
    /*
      here inside the product details we will have an array of objects : 
          "productDetails": [
        {
            "id": "65c0b2b661392dbf4075f26e",
            "quantity": 3,
            "totalPrice": 60
        },
        {
            "id": "65c0b0cf4c20f7d82c38199a",
            "quantity": 5,
            "totalPrice": 100
        },
        {
            "id": "65c0b0b44c20f7d82c381998",
            "quantity": 1,
            "totalPrice": 20
        }
    ]

    the total price will be sent from the front end 
    because I will be calculating it to show it to the user before he do an order,
    so I will multiply the quantity by the unit price for each product , and put it in localStorage
    I can do it in backend , but we should show the user the totalPrice for each item 
    */

    if ((!userId, !productDetails)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const allOrders = await Order.find();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const productIds = productDetails.map((item) => item.id);
    const products = await Product.find({ _id: { $in: productIds } });

    // Calculate the total price for each product
    const updatedProducts = products.map((product) => {
      const orderItem = productDetails.find(
        (item) => item.id.toString() === product._id.toString()
      );

      if (!orderItem) {
        return res.status(404).json({ error: "Product not found" });
      }

      return {
        ...product.toObject(),
        quantity: orderItem.quantity,
        totalPrice: orderItem.totalPrice,
      };
    });
    const totalPrice = updatedProducts.reduce(
      (total, product) => total + product.totalPrice,
      0
    );

    const order = await Order.create({
      status: "Initiated",
      userId: userId,
      productDetails: updatedProducts,
      totalPrice: totalPrice,
    });

    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Edit Order
export const editOrder = async (req, res) => {
  const id = req.body.id;
  const { status } = req.body;

  try {
    const editedOrder = await Order.findByIdAndUpdate(
      { _id: id },
      { status: status },
      {
        new: true,
      }
    );
    return res.status(200).json({ editedOrder });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Get Order By Id
export const getOrderById = async (req, res) => {
  const id = req.body.id;

  try {
    const order = await Order.findById(id).populate("userId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json({ data: order });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  const id = req.body.id;

  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order deleted successfully", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error", msg: error.message });
  }
};
