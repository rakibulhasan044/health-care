import axios from "axios";
import config from "../../../config";
import prisma from "../../../shared/prisma";

const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });
  const data = {
    store_id: config.ssl.store_id,
    store_passwd: config.ssl.store_passwd,
    total_amount: paymentData?.amount,
    currency: "BDT",
    tran_id: paymentData.transactionId,
    success_url: config.ssl.success_url,
    fail_url: config.ssl.fail_url,
    cancel_url: config.ssl.cancel_url,
    ipn_url: "http://localhost:3030/ipn",
    shipping_method: "Courier",
    product_name: "Appointment",
    product_category: "Service",
    product_profile: "general",
    cus_name: paymentData.appointment.patient.name,
    cus_email: paymentData.appointment.patient.email,
    cus_add1: paymentData.appointment.patient.address,
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: paymentData.appointment.patient.contactNumber,
    cus_fax: "01711111111",
    ship_name: "Customer Name",
    ship_add1: "N/A",
    ship_add2: "N/A",
    ship_city: "N/A",
    ship_state: "N/A",
    ship_postcode: 1000,
    ship_country: "N/A",
  };
    const response = await axios({
      method: "post",
      url: config.ssl.ssl_payment_api,
      data: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
};

export const PaymentService = {
  initPayment,
};
