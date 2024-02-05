import mongoose from "mongoose";
import Product from "../models/ProductModel.js";
import fs from "fs";

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// get last 4 products
export const getLastFourProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(4);

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// Get Product by name
export const getProductById = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const product = await Product.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({ error: "No such a product" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

// Get Product by name
export const getProductByName = async (req, res) => {
  const name = req.body.name;

  try {
    const product = await Product.findOne({ name: name });

    if (!product) {
      return res.status(404).json({ error: "No such a product" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

// Get All Products With Paginate
export const getAllProductsWithPaginate = async (req, res) => {
  try {
    const offset = req.offset || 0;
    const limit = req.limit || 10;

    const products = await Product.find().limit(limit).skip(offset).exec();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// Create a product
export const createProduct = async (req, res) => {
  const { name, description, price } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Please upload an image" });
  }
  const image = req.file.filename;

  try {
    const newProduct = await Product.create({
      name: name,
      description: description,
      price: price,
      image: image,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    console.log(error);
    res.status(500).json(error);
  }
};

// update a product
export const updateProduct = async (req, res) => {
  const id = req.body.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  const oldProduct = await Product.findById(id);

  try {
    const updatedData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
    };
    const oldImagePath = `public/images/${oldProduct.image}`;

    if (req.file) {
      updatedData.image = req.file.filename;

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          return res.status(500).json({
            error: `error deleting the old image`,
          });
        }
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      updatedData,
      {
        new: true,
      }
    );

    return res.json(updatedProduct);
  } catch (error) {
    return res.status(500).json({
      error: `Error, ${error.message}`,
    });
  }
};

// Delete a Product
export const deleteProduct = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findOne({ _id: id });

    const imagePath = `public/images/${product.image}`;
    fs.unlinkSync(imagePath);

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const getProductsByPriceRange = async (req, res) => {
  try {
    const { priceRanges } = req.body;

    if (
      !priceRanges ||
      !Array.isArray(priceRanges) ||
      priceRanges.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid or empty priceRanges array." });
    }

    const isValidRange = priceRanges.every((range) => {
      const [min, max] = range.split("-").map(parseFloat);
      return !isNaN(min) && !isNaN(max) && min < max;
    });

    if (!isValidRange) {
      return res.status(400).json({ error: "Invalid price range format." });
    }
    const priceQueries = priceRanges.map((range) => {
      const [min, max] = range.split("-").map(parseFloat);
      return { price: { $gte: min, $lte: max } };
    });

    const products = await Product.find({ $or: priceQueries }).sort({
      price: -1,
    });

    return res.json(products);
  } catch (error) {
    console.error("Error fetching products by price range:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
