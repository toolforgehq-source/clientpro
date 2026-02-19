const logger = require("../utils/logger");

const errorHandler = (err, req, res, _next) => {
  logger.error(err.stack || err.message);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { message: "Invalid JSON", code: "INVALID_JSON" },
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      error: { message: "Resource already exists", code: "DUPLICATE" },
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      error: { message: "Referenced resource not found", code: "FK_VIOLATION" },
    });
  }

  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  res.status(status).json({
    error: {
      message,
      code: err.code || "SERVER_ERROR",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
