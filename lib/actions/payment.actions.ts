"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Payment from "../database/models/payment.model";
import { PaymentParams } from "@/types";

// ====== CREATE PAYMENT
export const createPayment = async (params: PaymentParams) => {
  try {
    await connectToDatabase();
    const newPayment = await Payment.create(params);
    return JSON.parse(JSON.stringify(newPayment));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET ALL PAYMENTS
export const getAllPayments = async () => {
  try {
    await connectToDatabase();
    const payments = await Payment.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(payments));
  } catch (error) {
    handleError(error);
  }
};

// ====== GET PAYMENTS BY EMAIL
export const getPaymentsByEmail = async (seller: string) => {
  try {
    await connectToDatabase();
    const payments = await Payment.find({ seller }).sort({ date: -1 });

    if (!payments.length) {
      console.warn(`No payments found for seller: ${seller}`);
      return [];
    }

    return JSON.parse(JSON.stringify(payments));
  } catch (error) {
    console.error("Error fetching payments by seller:", error);
    handleError(error);
  }
};

// ====== UPDATE PAYMENT
export const updatePayment = async (
  paymentId: string,
  updateData: Partial<PaymentParams>
) => {
  try {
    await connectToDatabase();

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPayment) {
      throw new Error("Payment not found");
    }

    return JSON.parse(JSON.stringify(updatedPayment));
  } catch (error) {
    handleError(error);
  }
};

// ====== DELETE PAYMENT
export const deletePayment = async (paymentId: string) => {
  try {
    await connectToDatabase();

    const deletedPayment = await Payment.findByIdAndDelete(paymentId);

    if (!deletedPayment) {
      throw new Error("Payment not found");
    }

    return { message: "Payment deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
