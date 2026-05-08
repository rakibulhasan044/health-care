import { Request } from "express";
import { fileUploader } from "../../../helper/fileUploader";
import prisma from "../../../shared/prisma";

const insertIntoDB = async (req: Request) => {
  const file = req.file as Express.Multer.File;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }
  const result = await prisma.specialties.create({
    data: req.body,
  });
  return result;
};

const getAllFromDB = async () => {
  const result = await prisma.specialties.findMany();
  return result;
};

const getById = async (id: string) => {
  const result = await prisma.specialties.findUniqueOrThrow({
    where: {
      id,
    },
  });
  return result;
};

const deleteFromDB = async (id: string) => {
  await prisma.specialties.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });

  return result
};

export const SpecialtiesService = {
  insertIntoDB,
  getAllFromDB,
  getById,
  deleteFromDB
};
