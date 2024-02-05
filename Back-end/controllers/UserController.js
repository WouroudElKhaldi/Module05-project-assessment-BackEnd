import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import fs from "fs";
import { generateToken } from "../utils/Jwt.js";
import mongoose from "mongoose";

// Controller for adding a new user ()
export const addUser = async (req, res) => {
  const { firstName, lastName, email, password, role, phoneNumber } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
      return res.status(400).json({ error: "Email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (!req.file) {
      return res.status(400).json({ error: "Upload an image" });
    }

    const image = req.file.filename;

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "Admin",
      image,
      phoneNumber,
    });

    if (!newUser) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
    }

    res.status(200).json(newUser);
  } catch (error) {
    const imagePath = `public/images/${req.file.filename}`;
    fs.unlinkSync(imagePath);
    console.error(error);
    res.status(500).json({ err: "Internal Server Error", msg: error });
  }
};

// Controller for editing a user
export const editUser = async (req, res) => {
  const id = req.body.id;
  const {
    firstName,
    lastName,
    email,
    password,
    checkPassword,
    role,
    phoneNumber,
  } = req.body;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const existingUser = await User.findById(id);

    if (password) {
      const arePasswordSame = await bcrypt.compare(
        checkPassword,
        existingUser.password
      );

      if (!arePasswordSame) {
        return res.status(401).json({ message: "Invalid password" });
      }
    }

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let updatedImage = existingUser.image;
    if (req.file) {
      if (existingUser.image) {
        const imagePath = `public/images/${updatedImage}`;
        fs.unlinkSync(imagePath);
      }

      updatedImage = req.file?.filename;
    }

    let updatedUserData = {};
    if (password) {
      updatedUserData = {
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        email: email || existingUser.email,
        password: await bcrypt.hash(password, 10),
        role: role || existingUser.role,
        image: updatedImage,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
      };
    } else {
      updatedUserData = {
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        email: email || existingUser.email,
        role: role || existingUser.role,
        image: updatedImage,
        phoneNumber: phoneNumber || existingUser.phoneNumber,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, {
      new: true,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    if (req.file) {
      const imagePath = `public/images/${req.file.filename}`;
      fs.unlinkSync(imagePath);
    }
    res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for deleting a user
export const deleteUser = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne({ _id: id });

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const imagePath = `public/images/${user.image}`;
    fs.unlinkSync(imagePath);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

// Controller for getting all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({createdAt: -1})
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting one user by ID
export const getOneUser = async (req, res) => {
  const id = req.body.id;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", msg: error });
  }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "all fields are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken(user);

    // Set token in HTTP-only cookie
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for adding a new user ( and admin is adding another admin)
export const SignUp = async (req, res) => {
  const { firstName, lastName, email, password, role, phoneNumber } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      // const imagePath = `public/images/${req.file.filename}`;
      // fs.unlinkSync(imagePath);
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // const imagePath = `public/images/${req.file.filename}`;
      // fs.unlinkSync(imagePath);
      return res.status(400).json({ error: "Email already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // if (!req.file) {
    //   return res.status(400).json({ error: "Upload an image" });
    // }

    // const image = req.file.filename;

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "Customer",
      // image,
      phoneNumber,
    });

    // if (!newUser) {
    //   const imagePath = `public/images/${req.file.filename}`;
    //   fs.unlinkSync(imagePath);
    // }

    const token = generateToken(newUser);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json(newUser);
  } catch (error) {
    // const imagePath = `public/images/${req.file.filename}`;
    // fs.unlinkSync(imagePath);
    console.error(error);
    return res.status(500).json({ err: "Internal Server Error", msg: error });
  }
};

export const loggedInUser = (req, res) => {
  return res.json({ user: req.user }).status(200);
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
