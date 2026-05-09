import { Patient, UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IPatientUpdate } from "./patient.interface";

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

  console.log(patientHealthData, medicalReport);
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
  getByIdFromDB,
  deleteFromDB,
  updateIntoDB,
  softDelete,
};
