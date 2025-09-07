"use server";

import { CustomerParams } from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Customer from "../database/models/customer.model";

export const createCustomer = async (params: CustomerParams) => {
  try {
    await connectToDatabase();
    const newCustomer = await Customer.create(params);
    return JSON.parse(JSON.stringify(newCustomer));
  } catch (error) {
    handleError(error);
  }
};

export const getAllCustomers = async () => {
  try {
    await connectToDatabase();

    const customers = await Customer.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    handleError(error);
  }
};

export const getCustomerById = async (customerId: string) => {
  try {
    await connectToDatabase();

    const customer = await Customer.findById(customerId).lean();

    if (!customer) {
      return null;
    }

    return JSON.parse(JSON.stringify(customer));
  } catch (error) {
    handleError(error);
  }
};

export const getCustomersByEmail = async (addedBy: string) => {
  try {
    await connectToDatabase();
    const customers = await Customer.find({ addedBy }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    handleError(error);
  }
};

export const updateCustomer = async (
  customerId: string,
  updateData: Partial<CustomerParams>
) => {
  try {
    await connectToDatabase();

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      throw new Error("Customer not found");
    }

    return JSON.parse(JSON.stringify(updatedCustomer));
  } catch (error) {
    handleError(error);
  }
};

export const updateCustomerStatsAfterOrder = async ({
  customerId,
  orderAmount,
}: {
  customerId: string;
  orderAmount: number;
}) => {
  const customer = await getCustomerById(customerId);
  if (!customer) return;

  const totalOrders = parseInt(customer.totalOrders || "0") + 1;
  const totalSpend =
    parseFloat(customer.totalSpend || "0") + parseFloat(orderAmount.toFixed(2));

  await updateCustomer(customerId, {
    totalOrders: totalOrders.toString(),
    totalSpend: totalSpend.toFixed(2),
  });
};

export const deleteCustomer = async (customerId: string) => {
  try {
    await connectToDatabase();

    const deletedCustomer = await Customer.findByIdAndDelete(customerId);

    if (!deletedCustomer) {
      throw new Error("Customer not found");
    }

    return { message: "Customer deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};



