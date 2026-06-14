import { Patient, Prisma, UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IPatientFilterRequest, IPatientUpdate } from "./patient.interface";
import { calculatePagination } from "../../../helper/paginationHelper";
import { patientSearchableFields } from "./patient.constants";
import { IPagination } from "../../interfaces/pagination";

const getAllFromDB = async (
  filters: IPatientFilterRequest,
  options: IPagination,
  includeHealthData: boolean = false // NEW PARAMETER
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Conditional include based on parameter
  const includeClause = includeHealthData
    ? {
      medicalReport: true,
      patientHealthData: true,
    }
    : {
      medicalReport: {
        select: {
          id: true,
          reportName: true,
          createdAt: true,
        },
      },
    };

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
          createdAt: "desc",
        },
    include: includeClause,
  });

  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReports: true,
      patientHealthData: true,
    },
  });
  return result;
};

const updateIntoDB = async (
  id: string,
  payload: Partial<IPatientUpdate>,
): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (tran) => {
    //update Patient data
    await tran.patient.update({
      where: {
        id,
      },
      data: patientData,
      include: {
        medicalReports: true,
        patientHealthData: true,
      },
    });

    //create or update patient health data
    if (patientHealthData) {
      await tran.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: {
          ...patientHealthData,
          patientId: patientInfo.id,
        },
      });
    }
    if (medicalReport) {
      await tran.medicalReport.create({
        data: {
          ...medicalReport,
          patientId: patientInfo.id,
        },
      });
    }
  });

  const responseData = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id,
    },
    include: {
      patientHealthData: true,
      medicalReports: true,
    },
  });

  return responseData;
};

const deleteFromDB = async (id: string): Promise<Patient | null> => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      email: true,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    const deletedPatient = await tx.patient.delete({
      where: {
        id,
      },
    });

    await tx.user.delete({
      where: {
        email: patient.email,
      },
    });
    return deletedPatient;
  });

  return result;
};

const softDelete = async (id: string): Promise<Patient | null> => {
  return await prisma.$transaction(async (tx) => {
    const deletedPatient = await tx.patient.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    await tx.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return deletedPatient;
  });
};

export const PatientService = {
  getAllFromDB,
  getByIdFromDB,
  deleteFromDB,
  updateIntoDB,
  softDelete,
};
