import request from "supertest";
import { app } from "../src/app.js";
import {
  makePet,
  makeUser,
  PetModel,
  UserModel,
  AdoptionModel,
  oid,
} from "./factories.js";

const baseRoute = "/api/adoptions";

describe("Adoptions E2E Tests", () => {
  describe("GET /api/adoptions", () => {
    it("should return 200 and and array with all adoptions", async () => {
      const res = await request(app).get(baseRoute).expect(200);
      expect(Array.isArray(res.body.payload)).toBe(true);
    });
  });

  describe("POST /api/adoptions/:uid/:pid", () => {
    it("should create an adoption and sync relations (pet.owner & user.pets)", async () => {
      const user = await makeUser();
      const pet = await makePet();

      const res = await request(app).post(
        `${baseRoute}/${user._id}/${pet._id}`
      );
      expect(res.statusCode).toBe(201);
      expect(res.body.payload.user_id).toBe(String(user._id));
      expect(res.body.payload.pet_id).toBe(String(pet._id));

      const petDb = await PetModel.findById(pet._id);
      const userDb = await UserModel.findById(user._id);
      expect(String(petDb.owner)).toBe(String(user._id));
      expect(userDb.pets).toContainEqual(pet._id);
    });

    it("should return 400 if uid or pid are not valid ObjectIds", async () => {
      const res = await request(app)
        .post(`${baseRoute}/not-a-valid-id/also-bad`)
        .expect(400);

      expect(res.body.status).toBe("error");
      expect(res.body.code).toBe(400);
      expect(res.body.message).toMatch(/not a valid objectid/i);
    });

    it("should return 404 and an error message if uid or pid are not found ", async () => {
      const res = await request(app).post(`${baseRoute}/${oid()}/${oid()}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it("should return 409 if pet is already adopted and no partial changes in DB are traced", async () => {
      const [user1, user2] = await Promise.all([makeUser(), makeUser()]);
      const pet = await makePet({ owner: user1._id });
      user1.pets.push(pet._id);
      await user1.save();

      const res = await request(app)
        .post(`${baseRoute}/${user2._id}/${pet._id}`)
        .expect(409);

      expect(res.body.message).toMatch(/ already adopted/i);

      const petDb = await PetModel.findById(pet._id);
      const user2Db = await UserModel.findById(user2._id);
      expect(String(petDb.owner)).toBe(String(user1._id));
      expect(user2Db.pets).not.toContainEqual(pet._id);

      const adoption2 = await AdoptionModel.findOne({
        user_id: user2._id,
        pet_id: pet._id,
      });
      expect(adoption2).toBeNull();
    });

    it("should return 409 if owner has already adopted the pet and no partial changes in DB are traced", async () => {
      const user = await makeUser();
      const pet = await makePet();
      user.pets.push(pet._id);
      await user.save();
      pet.owner = user._id;
      await pet.save();

      const res = await request(app)
        .post(`${baseRoute}/${user._id}/${pet._id}`)
        .expect(409);

      expect(res.body.message).toMatch(/ already adopted/i);

      const petDb = await PetModel.findById(pet._id);
      const userDb = await UserModel.findById(user._id);
      expect(String(petDb.owner)).toBe(String(user._id));
      expect(userDb.pets).toContainEqual(pet._id);
    });
  });

  describe("PUT /api/adoptions/end/:aid", () => {
    it("ends an adoption and delete oid from relations (pet.owner & user.pets)", async () => {
      const user = await makeUser();
      const pet = await makePet();

      const post = await request(app)
        .post(`${baseRoute}/${user._id}/${pet._id}`)
        .expect(201);
      const aid = post.body.payload._id;

      const res = await request(app).put(`${baseRoute}/end/${aid}`).expect(200);
      expect(res.body.payload.ended_on).toBeDefined();

      const petDb = await PetModel.findById(pet._id);
      const userDb = await UserModel.findById(user._id);
      expect(petDb.owner).toBeNull();
      expect(userDb.pets).not.toContainEqual(pet._id);
    });

    it("should return 200 if is indempotent (adoption has already ended)", async () => {
      const user = await makeUser();
      const pet = await makePet();

      const post = await request(app)
        .post(`${baseRoute}/${user._id}/${pet._id}`)
        .expect(201);
      const aid = post.body.payload._id;

      await request(app).put(`${baseRoute}/end/${aid}`).expect(200);
      const again = await request(app)
        .put(`${baseRoute}/end/${aid}`)
        .expect(200);

      expect(again.body.message).toMatch(/already ended/i);
    });

    it("should return 400 if aid is not a valid ObjectId", async () => {
      const res = await request(app)
        .put(`${baseRoute}/end/not-a-valid-id`)
        .expect(400);

      expect(res.body.status).toBe("error");
      expect(res.body.code).toBe(400);
      expect(res.body.message).toMatch(/not a valid objectid/i);
    });

    it("should return 404 if adoption is not found", async () => {
      const res = await request(app).put(`${baseRoute}/end/${oid()}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it("should return 404 if if the user referenced by the adoption no longer exists", async () => {
      const user = await makeUser();
      const pet = await makePet();

      const post = await request(app)
        .post(`${baseRoute}/${user._id}/${pet._id}`)
        .expect(201);
      const aid = post.body.payload._id;

      await UserModel.deleteOne({ _id: user._id });

      const res = await request(app).put(`${baseRoute}/end/${aid}`).expect(404);
      expect(res.body.message).toMatch(/not found/i);

      const adoptionDB = await AdoptionModel.findById(aid);
      const petDB = await PetModel.findById(pet._id);
      expect(adoptionDB.ended_on).toBeUndefined();
      expect(String(petDB.owner)).toBe(String(user._id));
    });

    it("should return 404 if if the pet referenced by the adoption no longer exists", async () => {
      const user = await makeUser();
      const pet = await makePet();

      const post = await request(app)
        .post(`${baseRoute}/${user._id}/${pet._id}`)
        .expect(201);
      const aid = post.body.payload._id;

      await PetModel.deleteOne({ _id: pet._id });

      const res = await request(app).put(`${baseRoute}/end/${aid}`).expect(404);
      expect(res.body.message).toMatch(/not found/i);

      const adoptionDB = await AdoptionModel.findById(aid);
      const userDB = await UserModel.findById(user._id);
      expect(adoptionDB.ended_on).toBeUndefined();
      expect(userDB.pets).toContainEqual(pet._id);
    });

    it("should return 409 if pet is not owned by user", async () => {
      const [user1, user2] = await Promise.all([makeUser(), makeUser()]);
      const pet = await makePet();

      const post = await request(app)
        .post(`${baseRoute}/${user1._id}/${pet._id}`)
        .expect(201);
      const aid = post.body.payload._id;

      pet.owner = user2._id;
      await pet.save();

      const res = await request(app).put(`${baseRoute}/end/${aid}`).expect(409);
      expect(res.body.message).toMatch(/not owned by/i);

      const adoptionDB = await AdoptionModel.findById(aid);
      const userDB = await UserModel.findById(user1._id);
      const petDB = await PetModel.findById(pet._id);

      expect(adoptionDB.ended_on).toBeUndefined();
      expect(String(petDB.owner)).toBe(String(user2._id));
      expect(userDB.pets.map(String)).toContain(String(pet._id));
    });
  });

  describe("DELETE /api/adoptions/:aid", () => {
    it("should delete an adoption and remove it from relations (pet.owner & user.pets)", async () => {
      const user = await makeUser();
      const pet = await makePet();

      const post = await request(app)
        .post(`${baseRoute}/${user._id}/${pet._id}`)
        .expect(201);
      const aid = post.body.payload._id;

      const put = await request(app).put(`${baseRoute}/end/${aid}`);

      const res = await request(app).delete(`${baseRoute}/${aid}`);
      expect(res.statusCode).toBe(200);

      const userDB = await UserModel.findById(user._id);
      const petDB = await PetModel.findById(pet._id);
      expect(userDB.pets).not.toContainEqual(pet._id);
      expect(petDB.owner).toBeNull();
    });

    it("should return 400 if aid is not a valid ObjectId", async () => {
      const res = await request(app)
        .delete(`${baseRoute}/not-a-valid-id`)
        .expect(400);

      expect(res.body.status).toBe("error");
      expect(res.body.code).toBe(400);
      expect(res.body.message).toMatch(/not a valid objectid/i);
    });

    it("should return 404 if adoption is not found", async () => {
      const res = await request(app)
        .delete(`${baseRoute}/${oid()}`)
        .expect(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    it("should return 409 if adoption hasn't ended", async () => {
      const user = await makeUser();
      const pet = await makePet();

      const post = await request(app)
        .post(`${baseRoute}/${user._id}/${pet._id}`)
        .expect(201);
      const aid = post.body.payload._id;

      const res = await request(app).delete(`${baseRoute}/${aid}`).expect(409);
      expect(res.body.message).toMatch(/hasn't ended/i);
    });
  });

  describe("GET /api/adoptions/:aid", () => {
    it("should return 200 and an existing adoption", async () => {
      const user = await makeUser();
      const pet = await makePet();

      const post = await request(app).post(
        `${baseRoute}/${user._id}/${pet._id}`
      );
      const aid = post.body.payload._id;

      const res = await request(app).get(`${baseRoute}/${aid}`).expect(200);
      expect(res.body.payload._id).toBe(String(aid));
    });

    it("should return 400 if aid is not a valid ObjectId", async () => {
      const res = await request(app)
        .get(`${baseRoute}/not-a-valid-id`)
        .expect(400);

      expect(res.body.status).toBe("error");
      expect(res.body.code).toBe(400);
      expect(res.body.message).toMatch(/not a valid objectid/i);
    });

    it("should return 404 and an error message if adoption is not found", async () => {
      const res = await request(app).get(`${baseRoute}/${oid()}`).expect(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
