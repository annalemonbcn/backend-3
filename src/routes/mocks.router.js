import { Router } from "express";
import { BadRequestError } from "../utils/errors.js";

import UserModel from "../db/models/user.model.js";
import PetModel from "../db/models/pet.model.js";
import { generateMockPets, generateMockUsers } from "../utils/mock.js";

const router = Router();

router.get("/mockingpets", (req, res) => {
  const pets = generateMockPets(50);
  res.status(200).json(pets);
});

router.get("/mockingusers", (req, res) => {
  const users = generateMockUsers(50);
  res.status(200).json(users);
});

router.post("/generateData", async (req, res) => {
  const { users, pets } = req.body;
  if (!users || !pets)
    throw new BadRequestError("Users and pets are required.");

  const usersToInsert = generateMockUsers(parseInt(users));
  await UserModel.insertMany(usersToInsert);

  const petsToInsert = generateMockPets(parseInt(pets), usersToInsert);
  await PetModel.insertMany(petsToInsert);

  res.status(201).json({
    message: `${users} users and ${pets} pets generated and inserted successfully.`,
  });
});

export default router;
