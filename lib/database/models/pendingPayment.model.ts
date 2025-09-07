import { Document, Schema, model, models } from "mongoose";

export type CartItem = {
  _id: string;
  productId: string;
  title: string;
  images: string;
  price: number;
  sellingPrice: number;
  quantity: number;
  category: string;
  brand: string;
  sku: string;
  variations?: {
    name: string;
    value: string;
  }[];
};

export type Customer = {
  _id: string;
  name: string;
  email: string;
  number: string;
  address: string;
  areaOfDelivery: string;
  district: string;
};

export interface IPendingPayment extends Document {
  customer: Customer;
  cartItems: CartItem[];
  note: string;
  shipping: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  userEmail: string;
  reference: string;
  status: "pending" | "completed" | "failed"; // ✅ new field
  createdAt: Date;
}

const pendingPaymentSchema = new Schema<IPendingPayment>({
  customer: { type: Object, required: true },
  cartItems: { type: [{ type: Object, required: true }], required: true },
  note: { type: String },
  shipping: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  userEmail: { type: String, required: true },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }, // ✅ track payment status
  createdAt: { type: Date, default: Date.now },
});

const PendingPayment = models.PendingPayment || model<IPendingPayment>("PendingPayment", pendingPaymentSchema);

export default PendingPayment;
