import { Request, Response, NextFunction } from "express";
import { logger, redactSensitiveData } from "./logger";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const referenceId = `ERR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  logger.error(JSON.stringify({
    message: err.message,
    referenceId,
    method: req.method,
    path: req.path,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  }));

  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST");
  const message = statusCode >= 500 ? "An unexpected server error occurred. Please try again later." : err.message;

  res.status(statusCode).json({
    error: {
      code,
      message,
      referenceId
    }
  });
}
