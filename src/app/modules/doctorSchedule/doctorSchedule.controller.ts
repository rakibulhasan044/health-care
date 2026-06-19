import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { scheduleFilterableFields } from "./doctorSchedule.constant";
import { DoctorScheduleService } from "./doctorSchedule.service";

const createIntoDB = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await DoctorScheduleService.createIntoDB(user, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctors schedule created successfully",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req, res) => {
  const filters = pick(req.query, scheduleFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await DoctorScheduleService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor schedule retrieval successfully",
    meta: result.meta,
    data: result.date,
  });
});

const getMySchedule = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
  const options = pick(req.query, ["limit", "page", "sortby", "sortOrder"]);
  const user = req.user;

  const result = await DoctorScheduleService.getMySchedule(
    filters,
    options,
    user as IAuthUser,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule fetched successfully",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const result = await DoctorScheduleService.deleteFromDB(
    user as IAuthUser,
    id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My schedule deleted successfully",
    data: result,
  });
});

export const DoctorScheduleController = {
  createIntoDB,
  getAllFromDB,
  getMySchedule,
  deleteFromDB,
};
