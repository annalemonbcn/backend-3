import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  pet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pets",
    required: true,
  },
  started_on: {
    type: Date,
    default: Date.now,
  },
  ended_on: {
    type: Date,
  },
});

const AdoptionModel = mongoose.model("adoptions", adoptionSchema);

export default AdoptionModel;
