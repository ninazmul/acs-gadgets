import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/service/bkash";
import { connectToDatabase } from "@/lib/database";
import { storePendingRegisterPayment } from "@/lib/actions/pendingRegistrationPayment.actions";

connectToDatabase();

const bkashConfig = {
  base_url: process.env.BKASH_BASE_URL!,
  username: process.env.BKASH_CHECKOUT_URL_USER_NAME!,
  password: process.env.BKASH_CHECKOUT_URL_PASSWORD!,
  app_key: process.env.BKASH_CHECKOUT_URL_APP_KEY!,
  app_secret: process.env.BKASH_CHECKOUT_URL_APP_SECRET!,
};

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      number,
      address,
      district,
      shopName,
      shopLogo,
      website,
      amount,
    } = await req.json();

    if (!amount || !website) {
      return NextResponse.json(
        { message: "Amount and Website are required" },
        { status: 400 }
      );
    }

    const reference = crypto.randomUUID();

    // Store pending registration
    await storePendingRegisterPayment({
      name,
      email,
      number,
      address,
      district,
      shopName,
      shopLogo,
      reference,
      status: "pending",
      amount,
      website,
    });

    const callbackURL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/register/callback?reference=${reference}`;

    const paymentDetails = {
      amount,
      callbackURL,
      orderID: reference,
      reference,
      name,
      email,
      phone: number,
    };

    const createPaymentResponse = await createPayment(
      bkashConfig,
      paymentDetails
    );

    if (createPaymentResponse.statusCode !== "0000") {
      return NextResponse.json(
        { message: "Payment initiation failed", details: createPaymentResponse },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Payment initiated",
      url: createPaymentResponse.bkashURL,
    });
  } catch (error) {
    console.error("bKash Registration Payment Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
