import {
  SignUp,
  addUser,
  editUser,
  deleteUser,
  getAllUsers,
  getOneUser,
  logIn,
  loggedInUser,
  logOut,
} from "../controllers/UserController.js";
import { google } from "../controllers/OAuth.js";
import express from "express";
import upload from "../middleware/Multer.js";
import { authenticate, checkRole } from "../middleware/Auth.js";

const userRouter = express.Router();

userRouter.post("/signup", upload.single("image"), SignUp);
userRouter.post("/byId", authenticate, getOneUser);
userRouter.get("/", authenticate, checkRole(["Admin"]), getAllUsers);
userRouter.post(
  "/",
  authenticate,
  checkRole(["Admin"]),
  upload.single("image"),
  addUser
); // this is for the dashboard to add an admin
userRouter.patch("/", authenticate, upload.single("image"), editUser); // a user or admin can edit the personal info
userRouter.delete("/", authenticate, deleteUser); // a user or an admin can delete account
userRouter.post("/login", logIn); // all guests can login
userRouter.post("/logout", authenticate, logOut); // only a registered user can logout
userRouter.get("/logged-in-user", authenticate, loggedInUser);
userRouter.post("/google", google, loggedInUser); // all guests can login

export default userRouter;
