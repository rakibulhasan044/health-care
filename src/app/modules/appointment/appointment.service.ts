import prisma from "../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";
import { IFilterRequest } from "../schedule/schedule.interface";
import { IPagination } from "../../interfaces/pagination";
import { calculatePagination } from "../../helper/paginationHelper";
import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { stripe } from "../../../config/stripe.config";
import {
  appointmentRelationalFields,
  appointmentRelationalFieldsMapper,
} from "./appointment.constant";

const createAppointment = async (user: IAuthUser, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
      isDeleted: false,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId: string = uuidv4();

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData.id,
      },
    });

    //healthcare server
    const transactionId = String(uuidv4());
    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    //this part is only for stripe payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with Dr. ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 125,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },

      success_url: `${process.env.FRONTEND_URL}/dashboard/payment/payment-success`,

      cancel_url: `${process.env.FRONTEND_URL}/dashboard/appointments`,
    });
    return {
      appointmentData,
      paymentData,
      paymentUrl: session.url,
    };
  });

  return {
    appointment: result.appointmentData,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl,
  };
};

const createAppointmentWithPaymentLater = async (
  user: IAuthUser,
  payload: any,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
      isDeleted: false,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId: string = uuidv4();

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData.id,
      },
    });

    const transactionId = String(uuidv4());
    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });
    return {
      appointment: appointmentData,
      payment: paymentData,
    };
  });

  return result;
};

const initiatePayment = async (appointmentId: string, user: IAuthUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      patientId: patientData.id,
    },
    include: {
      doctor: true,
      payment: true,
    },
  });

  if (!appointmentData) {
    throw new ApiError(404, "Appointment not found");
  }

  if (!appointmentData.payment) {
    throw new ApiError(404, "Payment data not found for this appointment");
  }

  if (appointmentData.payment?.status === PaymentStatus.PAID) {
    throw new ApiError(404, "Payment already completed for this appointment");
  }

  if (appointmentData.status === AppointmentStatus.CANCELED) {
    throw new ApiError(404, "Appointment is canceled");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with Dr. ${appointmentData.doctor.name}`,
          },
          unit_amount: appointmentData.doctor.appointmentFee * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointmentData.id,
      paymentId: appointmentData.payment.id,
    },

    success_url: `${process.env.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointmentData.id}&payment_id=${appointmentData.payment.id}`,

    // cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard/appointments?error=payment_cancelled`,
  });

  return {
    paymentUrl: session.url,
  };
};

const allAppointments = async (filters: any, options: IPagination) => {
  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        if (appointmentRelationalFields.includes(key)) {
          return {
            [appointmentRelationalFieldsMapper[key]]: {
              email: (filterData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  // console.dir(andConditions, { depth: Infinity })
  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      doctor: true,
      patient: true,
    },
  });
  const total = await prisma.appointment.count({
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

const getMyAppointment = async (
  user: IAuthUser,
  filters: IFilterRequest,
  options: IPagination,
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { ...filterData } = filters;

  const andCondition: Prisma.AppointmentWhereInput[] = [];

  if (user?.role === UserRole.PATIENT) {
    andCondition.push({
      patient: {
        email: user?.email,
      },
    });
  } else if (user?.role === UserRole.DOCTOR) {
    andCondition.push({
      doctor: {
        email: user?.email,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andCondition.push(...filterConditions);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include:
      user?.role === UserRole.PATIENT
        ? { doctor: true, schedule: true }
        : {
            patient: {
              include: {
                medicalReports: true,
                patientHealthData: true,
              },
            },
            schedule: true,
          },
  });

  const total = await prisma.appointment.count({
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

const changeAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: IAuthUser,
) => {
  const appointmentData = await prisma.appointment.findFirstOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });

  if (user?.role == UserRole.DOCTOR) {
    if (user.email !== appointmentData.doctor.email) {
      throw new ApiError(401, "This is not your appointment");
    }
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });
  return result;
};

const cancelUnpaidAppointments = async () => {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentIdsToCancel = unPaidAppointments.map(
    (appointment) => appointment.id,
  );

  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentIdsToCancel,
        },
      },
    });

    await tx.appointment.deleteMany({
      where: {
        id: {
          in: appointmentIdsToCancel,
        },
      },
    });

    for (const upPaidAppointment of unPaidAppointments) {
      await tx.doctorSchedules.updateMany({
        where: {
          doctorId: upPaidAppointment.doctorId,
          scheduleId: upPaidAppointment.scheduleId,
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const AppointmentService = {
  createAppointment,
  allAppointments,
  getMyAppointment,
  changeAppointmentStatus,
  cancelUnpaidAppointments,
  createAppointmentWithPaymentLater,
  initiatePayment,
};
