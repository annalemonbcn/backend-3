import { Router } from "express";
import { validateMongooseObject } from "../utils/utils.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import AdoptionModel from "../db/models/adoption.model.js";
import PetModel from "../db/models/pet.model.js";
import UserModel from "../db/models/user.model.js";
import mongoose from "mongoose";

const router = Router();

router.get("/", async (req, res) => {
  const adoptions = await AdoptionModel.find();
  res.status(200).json({
    status: "success",
    code: 200,
    message: "Adoptions found successfully",
    payload: adoptions,
  });
});

router.get("/:aid", async (req, res) => {
  const { aid } = req.params;

  validateMongooseObject(aid);

  const adoption = await AdoptionModel.findById(aid);
  if (!adoption) throw new NotFoundError("Adoption not found.");

  res.status(200).json({
    status: "success",
    code: 200,
    message: "Adoption found successfully",
    payload: adoption,
  });
});

router.post("/:uid/:petid", async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const { uid, petid } = req.params;

      validateMongooseObject(uid);
      validateMongooseObject(petid);

      const user = await UserModel.findById(uid, null, { session });
      const pet = await PetModel.findById(petid, null, { session });

      if (!user) throw new NotFoundError("User not found.");
      if (!pet) throw new NotFoundError("Pet not found.");

      if (pet.owner) throw new AppError("Pet already adopted.", 409);
      const userHasPet = (user.pets || []).some(
        (id) => id.toString() === petid
      );
      if (userHasPet) throw new AppError("User already adopted this pet.", 409);

      pet.owner = uid;
      await pet.save({ session });

      user.pets.push(petid);
      await user.save({ session });

      const [adoption] = await AdoptionModel.create(
        [{ user_id: uid, pet_id: petid, started_on: new Date() }],
        { session }
      );

      res.status(201).json({
        status: "success",
        code: 201,
        message: "Adoption created successfully",
        payload: adoption,
      });
    });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
});

router.put("/end/:aid", async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const { aid } = req.params;
      validateMongooseObject(aid);

      const adoption = await AdoptionModel.findById(aid, null, { session });
      if (!adoption) throw new NotFoundError("Adoption not found.");

      if (adoption.ended_on) {
        return res.status(200).json({
          status: "success",
          code: 200,
          message: "Adoption already ended",
          payload: adoption,
        });
      }

      const user = await UserModel.findById(adoption.user_id, null, {
        session,
      });
      const pet = await PetModel.findById(adoption.pet_id, null, { session });
      if (!user) throw new NotFoundError("User not found.");
      if (!pet) throw new NotFoundError("Pet not found.");

      if (!pet.owner || pet.owner.toString() !== user._id.toString()) {
        throw new AppError("Pet is not owned by this adoption's user.", 409);
      }

      adoption.ended_on = new Date();
      await adoption.save({ session });

      pet.owner = null;
      await pet.save({ session });

      user.pets = (user.pets || []).filter(
        (id) => id.toString() !== pet._id.toString()
      );
      await user.save({ session });

      res.status(200).json({
        status: "success",
        code: 200,
        message: "Adoption ended successfully",
        payload: adoption,
      });
    });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
});

router.delete("/:aid", async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const { aid } = req.params;
      validateMongooseObject(aid);

      const adoption = await AdoptionModel.findById(aid, null, { session });
      if (!adoption) throw new NotFoundError("Adoption not found.");

      if (!adoption.ended_on) {
        throw new AppError(
          "Adoption hasn't ended. End it before deleting.",
          409
        );
      }

      const user = await UserModel.findById(adoption.user_id, null, {
        session,
      });
      const pet = await PetModel.findById(adoption.pet_id, null, { session });

      if (
        pet &&
        pet.owner &&
        pet.owner.toString() === adoption.user_id.toString()
      ) {
        pet.owner = null;
        await pet.save({ session });
      }
      if (
        user &&
        (user.pets || []).some(
          (id) => id.toString() === adoption.pet_id.toString()
        )
      ) {
        user.pets = user.pets.filter(
          (id) => id.toString() !== adoption.pet_id.toString()
        );
        await user.save({ session });
      }

      await AdoptionModel.deleteOne({ _id: aid }, { session });

      res.status(200).json({
        status: "success",
        code: 200,
        message: "Adoption deleted successfully",
        payload: { _id: aid },
      });
    });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
});

export default router;
