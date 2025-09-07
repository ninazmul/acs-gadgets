import { Document, Schema, model, models } from "mongoose";

export interface IPayment extends Document {
  _id: string;
  seller: string;
  amount: string;
  paymentMethod: string;
  accountDetails?: string;
  progress: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  seller: { type: String, required: true },
  amount: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  accountDetails: { type: String },
  progress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Payment = models.Payment || model<IPayment>("Payment", PaymentSchema);

export default Payment;
