const errorHandler = (err, req, res, next) => {
  console.error("Error in", err);

  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    status: "error",
    code: status,
    message,
  });
};

export { errorHandler };
