import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateToken } from "../utils/Jwt.js";
import User from "../models/UserModel.js";

dotenv.config();

export const google = async (req, res, next) => {
  const { name, email, photo } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = generateToken(user);
      const { password, ...rest } = user.toObject();
      res.cookie("token", token, { httpOnly: true }).status(200).json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      // Assuming the Google data includes both first and last names
      const fullName = name.split(" ");
      const generatedFirstName = fullName[0] || "DefaultFirstName";
      const generatedLastName =
        fullName.length > 1 ? fullName.slice(1).join(" ") : "DefaultLastName";

      const newUser = await User.create({
        firstName: generatedFirstName,
        lastName: generatedLastName,
        email: email,
        password: hashedPassword,
        image: photo,
        role: "Customer",
      });

      const token = generateToken({user : newUser});
      const { password, ...rest } = newUser.toObject();
      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
