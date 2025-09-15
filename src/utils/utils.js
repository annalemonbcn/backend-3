import mongoose from "mongoose";
import { BadRequestError } from "./errors.js";

const validateMongooseObject = (oid) => {
  if (!mongoose.Types.ObjectId.isValid(oid))
    throw new BadRequestError("The provided ID is not a valid ObjectId.");
};

export { validateMongooseObject };
