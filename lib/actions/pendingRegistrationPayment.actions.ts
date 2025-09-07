"use server";

import { StorePendingRegisterPaymentInput } from "@/types";
import { connectToDatabase } from "../database";
import PendingRegisterPayment from "../database/models/pendingRegistrationPayment.model";

// ✅ Create a new pending payment
export const storePendingRegisterPayment = async (params: StorePendingRegisterPaymentInput) => {
  try {
    await connectToDatabase();
    const newPendingRegisterPayment = await PendingRegisterPayment.create(params);
    return newPendingRegisterPayment.toObject(); // returns plain JS object
  } catch (error) {
    console.error("Error storing pending payment:", error);
    throw error; // rethrow so caller knows
  }
};

// ✅ Get a pending payment by reference
export const getPendingRegisterPaymentByReference = async (reference: string) => {
  try {
    await connectToDatabase();
    const pendingRegisterPayment = await PendingRegisterPayment.findOne({ reference }).lean();
    return pendingRegisterPayment; // null if not found
  } catch (error) {
    console.error("Error fetching pending payment:", error);
    throw error;
  }
};

// ✅ Delete an pendingRegisterPayment by ID
export const deletePendingRegisterPayment = async (pendingRegisterPaymentId: string) => {
  try {
    await connectToDatabase();
    const deletedPendingRegisterPayment = await PendingRegisterPayment.findByIdAndDelete(pendingRegisterPaymentId);
    if (!deletedPendingRegisterPayment) throw new Error("PendingRegisterPayment not found");
    return { message: "PendingRegisterPayment deleted successfully" };
  } catch (error) {
    console.error("Error deleting pendingRegisterPayment:", error);
    throw error;
  }
};

export const markPendingRegisterPaymentFailed = async (pendingRegisterPaymentId: string) => {
  try {
    await connectToDatabase();
    const updated = await PendingRegisterPayment.findByIdAndUpdate(
      pendingRegisterPaymentId,
      { status: "failed" },
      { new: true }
    );
    if (!updated) throw new Error("PendingRegisterPayment not found");
    return updated.toObject();
  } catch (error) {
    console.error("Error marking pending payment as failed:", error);
    throw error;
  }
};
