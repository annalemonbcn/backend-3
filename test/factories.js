import { Types } from "mongoose";
import UserModel from "../src/db/models/user.model.js";
import PetModel from "../src/db/models/pet.model.js";
import AdoptionModel from "../src/db/models/adoption.model.js";

const oid = () => new Types.ObjectId();

async function makeUser(overrides = {}) {
  const user = await UserModel.create({
    first_name: "Jane",
    last_name: "Doe",
    email: `jane-${oid()}@mail.com`,
    password: "123456",
    age: 25,
    pets: [],
    ...overrides,
  });
  return user;
}

async function makePet(overrides = {}) {
  const pet = await PetModel.create({
    name: "Fido",
    species: "dog",
    owner: null,
    ...overrides,
  });
  return pet;
}

export {
  makeUser,
  makePet,
  oid,
  UserModel,
  PetModel,
  AdoptionModel,
};
