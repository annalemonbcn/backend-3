# Backend-3

## 📌 Description

**Backend-3** is a backend application developed with **Node.js**, **Express**, and **MongoDB**, with support for deployment via **Docker**.

It includes end-to-end testing with **Jest** and **Supertest**.

It is designed to be a REST API that manages adoptions between users and pets, with a modular structure, validations, and the ability to run in any environment thanks to containerization.

---

## 🚀 Highlighted Features

- REST API with routes for users (and other entities).
- Modular code structure (`src`, `test` folders, etc.).
- Connection to MongoDB database (using `MONGO_URI` as an environment variable).
- Useful scripts defined in `package.json`:
- `npm run start` → Start the app in production mode.
- `npm run dev` → Development mode with automatic reloading (nodemon).
- `npm run test` → Run tests with Jest.
- Dockerized for easy deployments: you can run the app on any machine with Docker.

---

## 📁 Project Structure

- `src/` contains the server source code.
- `test/` contains the automated tests.
- `Dockerfile` and `docker-compose.yml` for local/production containerization.
- `jest.config.js` test configuration.
- `package.json` useful scripts.

## 🛠️ Prerequisites

Before running locally (without Docker):

- Have Node.js installed (version 18+, preferably 20)
- Accessible MongoDB (local or in the cloud)
- `.env` file with at least these variables:

```
MONGO_URI=<your connection string>
PORT=8080 # if not defined, 8080 will be used by default
```

---

## 🧪 Using locally (without Docker)

1. Clone the repository:
```bash
git clone https://github.com/annalemonbcn/backend-3.git
cd backend-3
git checkout develop
```

2. Install dependencies:
```
npm install
```

3. Create an **.env** file with your variables. Include especially **MONGO_URI** and **PORT**.

4. Launch the app in development mode:
```
npm run dev
```

Then visit: http://localhost:8080/api/users (or other defined paths).

For production:
```
npm run start
```

To run tests:
```
npm test
```
___
## 🐳 Use with Docker & Docker Hub
This application is designed to run inside a Docker container, making it easy to deploy to different environments without worrying about local dependencies.

### Build and run
```
docker build -t backend-3 .
docker run -p 8080:8080 \
-e MONGO_URI="<your connection string>" \
backend-3
```

Or using docker-compose (local):
```
docker-compose up --build
```

### Image on Docker Hub

You can directly use the image already published on Docker Hub:

Docker repository link:
https://hub.docker.com/repository/docker/annalemonbcn/backend-3/general

To run it:
```
docker pull annalemonbcn/backend-3:latest
docker run -p 8080:8080 \
-e MONGO_URI="<your connection string>" \
annalemonbcn/backend-3:latest
```

This will allow you to easily share your application without others having to rebuild it.

---

Thanks for reading!