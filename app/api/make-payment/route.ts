import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/service/bkash";
import { connectToDatabase } from "@/lib/database";
import { storePendingPayment } from "@/lib/actions/pendingPayment.actions";

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
      customer,
      cartItems,
      note,
      shipping,
      subtotal,
      total,
      paymentMethod,
      userEmail,
      reference,
    } = await req.json();

    // 1️⃣ Store pending payment in DB
    await storePendingPayment({
      customer,
      cartItems,
      note,
      shipping,
      subtotal,
      total,
      paymentMethod,
      userEmail,
      reference,
    });

    // 2️⃣ Create bKash payment
    const myUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "https://acsgadgets.com";

    const paymentDetails = {
      amount: paymentMethod === "bkash" ? total : 1, // full or advance
      callbackURL: `${myUrl}/api/callback?reference=${reference}`,
      orderID: reference,
      reference,
      name: customer.name,
      email: customer.email,
      phone: customer.number,
    };

    const createPaymentResponse = await createPayment(bkashConfig, paymentDetails);
    console.log("bKash Create Payment Response:", createPaymentResponse);

    if (createPaymentResponse.statusCode !== "0000") {
      return NextResponse.json({
        message: "Payment initiation failed",
        details: createPaymentResponse,
      }, { status: 400 });
    }

    return NextResponse.json({
      message: "Payment initiated",
      url: createPaymentResponse.bkashURL,
    });
  } catch (error) {
    console.error("bKash Payment Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
