import prisma from "../../../shared/prisma";

const createIntoDB = async (user: any) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  console.log(doctorData);
};


export const DoctorScheduleService = {
  createIntoDB,
};
