import prisma from "../../../shared/prisma";

const updateIntoDB = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  console.log(specialties);
  console.log(doctorData);
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    const updatedDoctorData = await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: true,
      },
    });

    if (specialties && specialties.length > 0) {
      const deletedSpecialtiesIds = specialties.filter(
        (specialty) => specialty.isDeleted,
      );
      console.log(deletedSpecialtiesIds);
      for (const specialty of deletedSpecialtiesIds) {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: doctorInfo.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }

      const createDoctorSpecialtiesIds = specialties.filter(
        (specialty) => !specialty.isDeleted,
      );
      for (const specialty of createDoctorSpecialtiesIds) {
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: doctorInfo.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }
    }
  });

  const result = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });
  return result;
};

export const DoctorService = {
  updateIntoDB,
};
