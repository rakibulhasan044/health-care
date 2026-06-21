import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { prescriptionFilterableFields } from "./prescription.constants";
import { PrescriptionService } from "./prescription.service";

const insertIntoDB = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await PrescriptionService.insertIntoDB(
    user as IAuthUser,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Prescription created successFully",
    data: result,
  });
});

const patientPrescription = catchAsync(async (req, res) => {
  const user = req.user;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await PrescriptionService.patientPrescription(
    user as IAuthUser,
    options,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Prescription fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllFromDB = catchAsync(async (req, res) => {
  const filters = pick(req.query, prescriptionFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await PrescriptionService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Prescriptions retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const PrescriptionController = {
  insertIntoDB,
  patientPrescription,
  getAllFromDB,
};
