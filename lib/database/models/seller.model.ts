import { Document, Schema, model, models } from "mongoose";

export interface ISeller extends Document {
  _id: string;
  name: string;
  email: string;
  number: string;
  shopName: string;
  shopLogo: string;
  district: string;
  address: string;
  website?: string;
  totalOrders?: number;
  totalSpend?: number;
  successfulOrder?: number;
  canceledOrder?: number;
  totalPaid?: number;
  totalDue?: number;
  status?: string;
  transactionId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISeller>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String, required: true },
    shopName: { type: String, required: true },
    shopLogo: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String },

    totalOrders: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    successfulOrder: { type: Number, default: 0 },
    canceledOrder: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
    status: { type: String, default: "Pending" },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Seller = models.Seller || model<ISeller>("Seller", SellerSchema);

export default Seller;
