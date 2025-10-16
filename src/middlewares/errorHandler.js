import dotenv from "dotenv";
dotenv.config();

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("Error in", err);
  }
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    status: "error",
    code: status,
    message,
  });
};

export { errorHandler };
