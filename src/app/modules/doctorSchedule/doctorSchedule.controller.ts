import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
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

export const DoctorScheduleController = {
  createIntoDB,
  getMySchedule,
};
