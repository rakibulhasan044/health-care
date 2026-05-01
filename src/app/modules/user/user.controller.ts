import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";

const createAdmin = async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin Created Successfully",
    data: result,
  });
};

export const UserController = {
  createAdmin,
};
