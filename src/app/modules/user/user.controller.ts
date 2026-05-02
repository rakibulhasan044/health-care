import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.constant";
import { IAuthUser } from "../../interfaces/common";

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

const getAllFromDB = catchAsync(async (req, res) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await UserService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users data fetched",
    meta: result.meta,
    data: result.data,
  });
});

const changeProfileStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.changeProfileStatus(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile status changed",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const user = req.user
  console.log(user);
  const result = await UserService.getMyProfile(user as IAuthUser);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My profile data fetched",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const user = req.user
  const result = await UserService.updateMyProfile(user as IAuthUser, req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My profile data updated",
    data: result,
  });
});

export const UserController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile
};
