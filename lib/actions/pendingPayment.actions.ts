"use server";

import { connectToDatabase } from "../database";
import PendingPayment from "../database/models/pendingPayment.model";
import { StorePendingPaymentInput } from "@/types";

// ✅ Create a new pending payment
export const storePendingPayment = async (params: StorePendingPaymentInput) => {
  try {
    await connectToDatabase();
    const newPendingPayment = await PendingPayment.create(params);
    return newPendingPayment.toObject(); // returns plain JS object
  } catch (error) {
    console.error("Error storing pending payment:", error);
    throw error; // rethrow so caller knows
  }
};

// ✅ Get a pending payment by reference
export const getPendingPaymentByReference = async (reference: string) => {
  try {
    await connectToDatabase();
    const pendingPayment = await PendingPayment.findOne({ reference }).lean();
    return pendingPayment; // null if not found
  } catch (error) {
    console.error("Error fetching pending payment:", error);
    throw error;
  }
};

// ✅ Delete an pendingPayment by ID
export const deletePendingPayment = async (pendingPaymentId: string) => {
  try {
    await connectToDatabase();
    const deletedPendingPayment = await PendingPayment.findByIdAndDelete(pendingPaymentId);
    if (!deletedPendingPayment) throw new Error("PendingPayment not found");
    return { message: "PendingPayment deleted successfully" };
  } catch (error) {
    console.error("Error deleting pendingPayment:", error);
    throw error;
  }
};

export const markPendingPaymentFailed = async (pendingPaymentId: string) => {
  try {
    await connectToDatabase();
    const updated = await PendingPayment.findByIdAndUpdate(
      pendingPaymentId,
      { status: "failed" },
      { new: true }
    );
    if (!updated) throw new Error("PendingPayment not found");
    return updated.toObject();
  } catch (error) {
    console.error("Error marking pending payment as failed:", error);
    throw error;
  }
};
