import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PatientService } from "./patient.service";
import pick from "../../../shared/pick";
import { patientFilterableFields } from "./patient.constants";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await PatientService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Patient retrieval successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.getByIdFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient retrieval successfully",
    data: result,
  });
});

const updateIntoDB = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await PatientService.updateIntoDB(id as string, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.deleteFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

const softDelete = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PatientService.deleteFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

export const PatientController = {
  getAllFromDB,
  getByIdFromDB,
  deleteFromDB,
  updateIntoDB,
  softDelete
};
