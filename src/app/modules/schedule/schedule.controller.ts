import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { ScheduleService } from "./schedule.service";

const createIntoDB = catchAsync(async (req, res) => {
  const result = await ScheduleService.createIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['startDate', 'endDate'])
  const options =pick(req.query, ['limit', 'page', 'sortby', 'sortOrder'])
  const user = req.user

  const result = await ScheduleService.getAllFromDB(filters, options, user as IAuthUser);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule fetched successfully",
    data: result,
  });
});

const deleteAllSchedule = catchAsync(async (req, res) => {
  const result = await ScheduleService.deleteAllSchedule();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const ScheduleController = {
  createIntoDB,
  deleteAllSchedule,
  getAllFromDB
};
