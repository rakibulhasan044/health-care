import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DoctorService } from "./doctor.service";
import pick from "../../../shared/pick";
import { doctorFilterableFields } from "./doctor.constants";
import httpStatus from "http-status";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, doctorFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await DoctorService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctors retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.getByIdFromDB(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrieval successfully",
    data: result,
  });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.updateIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor updated successfully",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.deleteFromDB(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

const softDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.softDelete(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor soft deleted successfully",
    data: result,
  });
});

export const DoctorController = {
  getAllFromDB,
  updateIntoDB,
  getByIdFromDB,
  deleteFromDB,
  softDelete,
};
