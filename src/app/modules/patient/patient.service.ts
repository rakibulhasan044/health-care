import { Patient } from "@prisma/client";
import prisma from "../../../shared/prisma";

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

const updateIntoDB = async (id: string, payload: any) => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  console.log(patientHealthData, medicalReport);
  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.$transaction(async (tran) => {
    //update Patient data
    const updatedPatient = await tran.patient.update({
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
      const healthData = await tran.patientHealthData.upsert({
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
      const report = await tran.medicalReport.create({
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
      medicalReports: true
    }
  });

  return responseData;
};

const deleteFromDB = async (id: string): Promise<Patient | null> => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.patient.delete({
    where: {
      id,
    },
    include: {
      medicalReports: true,
      patientHealthData: true,
    },
  });
  return result;
};

export const PatientService = {
  getByIdFromDB,
  deleteFromDB,
  updateIntoDB,
};
