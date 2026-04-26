import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";

const getAllFromDB = async (req: Request, res: Response) => {
  try {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortOrder", "sortBy"]);
    console.log(options);

    const result = await AdminService.getAllFromDB(filters, options);
    res.status(200).json({
      success: true,
      message: "Admin data fetched",
      meta: result.meta,
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};

export const AdminController = {
  getAllFromDB,
};
