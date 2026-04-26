import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error?.name || "something went wrong",
    error: error,
  });
};

export default globalErrorHandler;
