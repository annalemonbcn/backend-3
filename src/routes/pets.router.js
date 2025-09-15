import { Router } from "express";
import { NotFoundError } from "../utils/errors.js";
import { validateMongooseObject } from "../utils/utils.js";

import PetModel from "../db/models/pet.model.js";

const router = Router();

router.get("/", async (req, res) => {
  const pets = await PetModel.find();
  res.status(200).json(pets);
});

router.get("/:pid", async (req, res) => {
  const { pid } = req.params;

  validateMongooseObject(pid);

  const pet = await PetModel.findById(pid);
  if (!pet) throw new NotFoundError("Pet not found.");

  res.status(200).json(pet);
});

router.post("/", async (req, res) => {
  const newPet = req.body;

  const result = await PetModel.create(newPet);
  res.status(201).json({ message: "Pet created successfully", pet: result });
});

router.put("/:pid", async (req, res) => {
  const { pid } = req.params;
  const updatedData = req.body;

  validateMongooseObject(pid);

  const updatedPet = await PetModel.findByIdAndUpdate(pid, updatedData, {
    new: true,
    runValidators: true,
  });
  if (!updatedPet) throw new NotFoundError("Pet not found.");

  res
    .status(200)
    .json({ message: "Pet updated successfully", pet: updatedPet });
});

router.delete("/:pid", async (req, res) => {
  const { pid } = req.params;

  validateMongooseObject(pid);

  const deletedPet = await PetModel.findByIdAndDelete(pid);
  if (!deletedPet) throw new NotFoundError("Pet not found.");

  res
    .status(200)
    .json({ message: "Pet deleted successfully", pet: deletedPet });
});

export default router;
