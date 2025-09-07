"use server";

import { SellerParams } from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Seller from "../database/models/seller.model";

export const createSeller = async (params: SellerParams) => {
  try {
    await connectToDatabase();
    const newSeller = await Seller.create(params);
    return JSON.parse(JSON.stringify(newSeller));
  } catch (error) {
    handleError(error);
  }
};

export const getAllSellers = async () => {
  try {
    await connectToDatabase();

    const sellers = await Seller.find().sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(sellers));
  } catch (error) {
    handleError(error);
  }
};

export const getSellerById = async (sellerId: string) => {
  try {
    await connectToDatabase();

    const seller = await Seller.findById(sellerId).lean();

    if (!seller) {
      return null;
    }

    return JSON.parse(JSON.stringify(seller));
  } catch (error) {
    handleError(error);
  }
};

export const getSellerByEmail = async (email: string) => {
  try {
    await connectToDatabase();

    const seller = await Seller.findOne({ email }).lean();

    if (!seller) {
      return null;
    }

    return JSON.parse(JSON.stringify(seller));
  } catch (error) {
    handleError(error);
  }
};

export async function isSeller(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }

  try {
    await connectToDatabase();

    const seller = await Seller.findOne({ email });

    if (!seller) {
      console.log(`No seller found for email: ${email}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking seller status:", error);
    return false;
  }
}

export const updateSeller = async (
  sellerId: string,
  updateData: Partial<SellerParams>
) => {
  try {
    await connectToDatabase();

    const updatedSeller = await Seller.findByIdAndUpdate(sellerId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSeller) {
      throw new Error("Seller not found");
    }

    return JSON.parse(JSON.stringify(updatedSeller));
  } catch (error) {
    handleError(error);
  }
};

export const updateSellerStatsAfterOrder = async ({
  sellerId,
  orderAmount,
}: {
  sellerId: string;
  orderAmount: number;
}) => {
  const seller = await getSellerById(sellerId);
  if (!seller) return;

  const totalOrders = parseInt(seller.totalOrders || "0") + 1;
  const totalSpend =
    parseFloat(seller.totalSpend || "0") + parseFloat(orderAmount.toFixed(2));

  await updateSeller(sellerId, {
    totalOrders: totalOrders,
    totalSpend: totalSpend,
  });
};

export const deleteSeller = async (sellerId: string) => {
  try {
    await connectToDatabase();

    const deletedSeller = await Seller.findByIdAndDelete(sellerId);

    if (!deletedSeller) {
      throw new Error("Seller not found");
    }

    return { message: "Seller deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
