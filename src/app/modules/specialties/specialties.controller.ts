import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SpecialtiesService } from "./specialties.service";

const insertIntoDB = catchAsync(async (req, res) => {
  const result = await SpecialtiesService.insertIntoDB(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialties created successfully",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req, res) => {
  const result = await SpecialtiesService.getAllFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All specialties retrieved successfully",
    data: result,
  });
});

const getById = catchAsync(async (req, res) => {
  const result = await SpecialtiesService.getById(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialty retrieved successfully",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req, res) => {
  const result = await SpecialtiesService.deleteFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});
export const SpecialtiesController = {
  insertIntoDB,
  getAllFromDB,
  getById,
  deleteFromDB,
};

