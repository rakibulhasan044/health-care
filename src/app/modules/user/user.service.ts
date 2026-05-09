import { Admin, Doctor, Prisma, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../../helper/fileUploader";
import { Request } from "express";
import { IPagination } from "../../interfaces/pagination";
import { calculatePagination } from "../../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { IAuthUser } from "../../interfaces/common";

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;
  const data = req.body;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    data.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const { email, name, contactNumber, profilePhoto } = data.admin;
    const createdAdminData = await transactionClient.admin.create({
      data: {
        email,
        name,
        contactNumber,
        // ...(profilePhoto && { profilePhoto }),
        profilePhoto,
      },
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {
  const file = req.file;
  const data = req.body;

  if (!data.doctor) {
    throw new Error("Doctor data is required");
  }

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    data.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    email: data.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const {
      email,
      name,
      contactNumber,
      profilePhoto,
      address,
      registrationNumber,
      experience,
      gender,
      appointmentFee,
      qualification,
      currentWorkingPlace,
      designation,
    } = data.doctor;

    const createdDoctorData = await transactionClient.doctor.create({
      data: {
        name,
        email,
        contactNumber,
        profilePhoto,
        address,
        registrationNumber,
        experience,
        gender,
        appointmentFee,
        qualification,
        currentWorkingPlace,
        designation,
      },
    });

    return createdDoctorData;
  });

  return result;
};

const createPatient = async (req: Request) => {
  const file = req.file;
  const data = req.body;

  console.log(file);
  console.log(data);

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    data.patient.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    email: data.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const { email, name, contactNumber, profilePhoto, address } = data.patient;

    const createdPatientData = await transactionClient.patient.create({
      data: {
        name,
        email,
        contactNumber,
        profilePhoto,
        address,
      },
    });

    return createdPatientData;
  });

  return result;
};

const getAllFromDB = async (params: any, options: IPagination) => {
  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondition: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andCondition.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      doctor: true,
      patient: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const changeProfileStatus = async (id: string, status: UserRole) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });

  return updateUserStatus;
};

const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      needPasswordChange: true,
      email: true,
      role: true,
      status: true,
    },
  });
  let profileInfo;
  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }
  return { ...userInfo, ...profileInfo };
};

const updateMyProfile = async (user: IAuthUser, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = req.file as Express.Multer.File;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = uploadToCloudinary?.secure_url;
  }

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }
  return { ...profileInfo };
};

export const UserService = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
