import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/actions/order.actions";
import { decreaseProductQuantity } from "@/lib/actions/product.actions";
import { executePayment } from "@/lib/service/bkash";
import { deleteCartsByEmail } from "@/lib/actions/cart.actions";
import {
  getPendingPaymentByReference,
  deletePendingPayment,
  markPendingPaymentFailed,
} from "@/lib/actions/pendingPayment.actions";

type Customer = {
  _id: string;
  name: string;
  email: string;
  number: string;
  address: string;
  areaOfDelivery: string;
  district: string;
};

type CartItem = {
  _id: string;
  productId: string;
  title: string;
  images: string;
  price: number;
  quantity: number;
  category: string;
  brand: string;
  sku: string;
  variations?: {
    name: string;
    value: string;
  }[];
};

type PendingPayment = {
  _id: string;
  customer: Customer;
  cartItems: CartItem[];
  note?: string;
  shipping: number;
  subtotal: number;
  total: number;
  paymentMethod: "bkash" | "cod";
  userEmail: string;
  status?: "pending" | "completed" | "failed";
};

type OrderPayload = {
  customer: Customer;
  products: CartItem[];
  note?: string;
  subtotal: number;
  shipping: number;
  totalAmount: number;
  paymentMethod: "bkash" | "cod";
  advancePaid: number;
  transactionId: string;
  email: string;
};

// --- bKash config ---
const bkashConfig = {
  base_url: process.env.BKASH_BASE_URL!,
  username: process.env.BKASH_CHECKOUT_URL_USER_NAME!,
  password: process.env.BKASH_CHECKOUT_URL_PASSWORD!,
  app_key: process.env.BKASH_CHECKOUT_URL_APP_KEY!,
  app_secret: process.env.BKASH_CHECKOUT_URL_APP_SECRET!,
};

// --- GET handler ---
export async function GET(req: NextRequest) {
  const myUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ?? "https://dropandshipping.com";

  try {
    const query = req.nextUrl.searchParams;
    const paymentID = query.get("paymentID");
    const status = query.get("status");
    const reference = query.get("reference");

    if (!reference) return NextResponse.redirect(`${myUrl}/checkout`, 303);

    // 1️⃣ Get pending payment
    const pendingPayment = (await getPendingPaymentByReference(
      reference
    )) as PendingPayment | null;
    if (!pendingPayment) return NextResponse.redirect(`${myUrl}/checkout`, 303);

    const {
      customer,
      cartItems,
      note,
      shipping,
      subtotal,
      total,
      paymentMethod,
      userEmail,
      _id,
    } = pendingPayment;

    let advancePaid = 0;
    let transactionId = "";

    // 2️⃣ Handle bKash payment
    if (paymentMethod === "bkash") {
      if (!paymentID || status !== "success") {
        console.error("bKash payment canceled or failed", {
          paymentID,
          status,
        });
        if (_id) await markPendingPaymentFailed(_id.toString());
        return NextResponse.redirect(`${myUrl}/checkout`, 303);
      }

      const executeResponse = await executePayment(bkashConfig, paymentID);
      if (!executeResponse || executeResponse.statusCode !== "0000") {
        console.error("bKash executePayment failed", executeResponse);
        if (_id) await markPendingPaymentFailed(_id.toString());
        return NextResponse.redirect(`${myUrl}/checkout`, 303);
      }

      // ✅ Use actual bKash transaction ID and paid amount from execute response
      advancePaid = parseFloat(executeResponse.amount) || 0;
      transactionId =
        executeResponse.trxID || executeResponse.paymentID || paymentID;
    }

    // 3️⃣ Handle COD payment
    if (paymentMethod === "cod") {
      if (!paymentID || status !== "success") {
        console.error("bKash payment canceled or failed", {
          paymentID,
          status,
        });
        if (_id) await markPendingPaymentFailed(_id.toString());
        return NextResponse.redirect(`${myUrl}/checkout`, 303);
      }

      const executeResponse = await executePayment(bkashConfig, paymentID);
      if (!executeResponse || executeResponse.statusCode !== "0000") {
        console.error("bKash executePayment failed", executeResponse);
        if (_id) await markPendingPaymentFailed(_id.toString());
        return NextResponse.redirect(`${myUrl}/checkout`, 303);
      }

      // ✅ Use actual bKash transaction ID and paid amount from execute response
      advancePaid = parseFloat(executeResponse.amount) || 0;
      transactionId =
        executeResponse.trxID || executeResponse.paymentID || paymentID;
    }

    if (advancePaid <= 0) {
      console.error("No valid payment received, order will not be created");
      return NextResponse.redirect(`${myUrl}/checkout`, 303);
    }

    // 4️⃣ Create order
    const orderPayload: OrderPayload = {
      customer,
      products: cartItems,
      note,
      subtotal,
      shipping,
      totalAmount: total,
      paymentMethod,
      advancePaid,
      transactionId,
      email: userEmail,
    };

    const createdOrder = await createOrder(orderPayload);

    // 5️⃣ Clear cart & update inventory
    await deleteCartsByEmail(userEmail);
    await Promise.all(
      cartItems.map((item) =>
        decreaseProductQuantity(item.productId, item.quantity)
      )
    );

    // 8️⃣ Remove pending payment
    if (_id) await deletePendingPayment(_id.toString());

    // 9️⃣ Redirect to order success page
    return NextResponse.redirect(
      `${myUrl}/dashboard/orders/${createdOrder._id}`,
      303
    );
  } catch (err) {
    console.error("Order processing error:", err);
    return NextResponse.redirect(`${myUrl}/checkout`, 303);
  }
}
