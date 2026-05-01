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

const createDoctor = async (req: Request, res: Response) => {
  const result = await UserService.createDoctor(req);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor Created Successfully",
    data: result,
  });
};

const createPatient = async (req: Request, res: Response) => {
  const result = await UserService.createPatient(req);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient Created Successfully",
    data: result,
  });
};

export const UserController = {
  createAdmin,
  createDoctor,
  createPatient
};
