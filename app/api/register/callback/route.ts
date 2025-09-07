import { NextRequest, NextResponse } from "next/server";
import { executePayment } from "@/lib/service/bkash";
import { createSeller } from "@/lib/actions/seller.actions";
import {
  deletePendingRegisterPayment,
  getPendingRegisterPaymentByReference,
  markPendingRegisterPaymentFailed,
} from "@/lib/actions/pendingRegistrationPayment.actions";

type PendingRegister = {
  _id: string;
  name: string;
  email: string;
  number: string;
  address: string;
  district: string;
  shopName: string;
  shopLogo: string;
  website?: string;
  reference: string;
  amount: number;
  status?: "pending" | "completed" | "failed";
};

const bkashConfig = {
  base_url: process.env.BKASH_BASE_URL!,
  username: process.env.BKASH_CHECKOUT_URL_USER_NAME!,
  password: process.env.BKASH_CHECKOUT_URL_PASSWORD!,
  app_key: process.env.BKASH_CHECKOUT_URL_APP_KEY!,
  app_secret: process.env.BKASH_CHECKOUT_URL_APP_SECRET!,
};

export async function GET(req: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ?? "https://dropandshipping.com";

  try {
    const query = req.nextUrl.searchParams;
    const paymentID = query.get("paymentID");
    const reference = query.get("reference");
    const status = query.get("status");

    if (!reference) return NextResponse.redirect(`${baseUrl}/register`, 303);

    const pendingRegister = (await getPendingRegisterPaymentByReference(
      reference
    )) as PendingRegister | null;
    if (!pendingRegister)
      return NextResponse.redirect(`${baseUrl}/register`, 303);

    if (status !== "success" || !paymentID) {
      await markPendingRegisterPaymentFailed(pendingRegister._id);
      return NextResponse.redirect(`${baseUrl}/register/`, 303);
    }

    const executeResponse = await executePayment(bkashConfig, paymentID);

    if (!executeResponse || executeResponse.statusCode !== "0000") {
      await markPendingRegisterPaymentFailed(pendingRegister._id);
      return NextResponse.redirect(`${baseUrl}/register`, 303);
    }

    const transactionId =
      executeResponse.trxID || executeResponse.paymentID || paymentID;
    const paidAmount = parseFloat(executeResponse.amount) || 0;

    if (paidAmount <= 0) {
      await markPendingRegisterPaymentFailed(pendingRegister._id);
      return NextResponse.redirect(`${baseUrl}/register`, 303);
    }

    // ✅ Create seller
    await createSeller({
      name: pendingRegister.name,
      email: pendingRegister.email,
      number: pendingRegister.number,
      address: pendingRegister.address,
      district: pendingRegister.district,
      shopName: pendingRegister.shopName,
      shopLogo: pendingRegister.shopLogo,
      website: pendingRegister.website,
      transactionId,
      amount: paidAmount,
    });

    await deletePendingRegisterPayment(pendingRegister._id);

    return NextResponse.redirect(`${baseUrl}/register`, 303);
  } catch (error) {
    console.error("Registration callback error:", error);
    return NextResponse.redirect(`${baseUrl}/register`, 303);
  }
}
