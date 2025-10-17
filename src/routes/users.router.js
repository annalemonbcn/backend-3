import { Router } from "express";

import UserModel from "../db/models/user.model.js";
import { validateMongooseObject } from "../utils/utils.js";
import { NotFoundError } from "../utils/errors.js";

const router = Router();

router.get("/", async (req, res) => {
  const users = await UserModel.find();
  res.status(200).json({
    status: "success",
    code: 200,
    message: "Users found successfully",
    payload: users,
  });
});

router.get("/:uid", async (req, res) => {
  const { uid } = req.params;

  validateMongooseObject(uid);

  const user = await UserModel.findById(uid);
  if (!user) throw new NotFoundError("User not found.");

  res.status(200).json(user);
});

router.put("/:uid", async (req, res) => {
  const { uid } = req.params;
  const updatedData = req.body;

  validateMongooseObject(uid);

  const updatedUser = await UserModel.findByIdAndUpdate(uid, updatedData, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) throw new NotFoundError("User not found.");

  res
    .status(200)
    .json({ message: "User updated successfully", user: updatedUser });
});

router.delete("/:uid", async (req, res) => {
  const { uid } = req.params;

  validateMongooseObject(uid);

  const deletedUser = await UserModel.findByIdAndDelete(uid);
  if (!deletedUser) throw new NotFoundError("User not found.");

  res
    .status(200)
    .json({ message: "User deleted successfully", user: deletedUser });
});

router.post("/", async (req, res) => {
  const userData = req.body;

  const user = await UserModel.create(userData);
  res.status(201).json({
    status: "success",
    code: 201,
    message: "User created successfully",
    payload: user,
  });
});

router.post("/batch", async (req, res) => {
  const users = req.body;

  const result = await UserModel.insertMany(users);
  res
    .status(201)
    .json({ message: "Users created successfully", users: result });
});

export default router;
