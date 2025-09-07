import { Document, Schema, model, models } from "mongoose";

export interface IPendingRegisterPayment extends Document {
  name: string;
  email: string;
  number: number;
  address: string;
  district: string;
  shopName: string;
  shopLogo: string;
  website?: string;
  amount: number;
  reference: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

const pendingRegisterPaymentSchema = new Schema<IPendingRegisterPayment>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  number: { type: Number, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  shopName: { type: String, required: true },
  shopLogo: { type: String, required: true },
  website: { type: String },
  amount: { type: Number, required: true },
  reference: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const PendingRegisterPayment =
  models.PendingRegisterPayment ||
  model<IPendingRegisterPayment>(
    "PendingRegisterPayment",
    pendingRegisterPaymentSchema
  );

export default PendingRegisterPayment;
