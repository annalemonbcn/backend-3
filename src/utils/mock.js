import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

const generateMockDog = (uid = null) => {
  return {
    name: faker.animal.dog(),
    species: "dog",
    owner: uid,
  };
};

const generateMockPets = (count, users = []) => {
  const pets = [];
  for (let i = 0; i < count; i++) {
    if (users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      pets.push(generateMockDog(randomUser._id));
    } else {
      pets.push(generateMockDog()); // sin owner
    }
  }
  return pets;
};

const generateMockUser = () => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("coder123", salt);

  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 80 }),
    password: hashedPassword,
    role: faker.helpers.arrayElement(["user", "admin"]),
    pets: [],
  };
};

const generateMockUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(generateMockUser());
  }
  return users;
};

export { generateMockPets, generateMockUsers };
