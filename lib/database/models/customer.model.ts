import { Document, Schema, model, models } from "mongoose";

export interface ICustomer extends Document {
  _id: string;
  name: string;
  district: string;
  address: string;
  areaOfDelivery: string;
  number: string;
  email: string;
  addedBy: string;
  totalOrders?: string;
  totalSpend?: string;
  successfulOrder?: string;
  canceledOrder?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required: true },
    areaOfDelivery: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true },
    addedBy: { type: String, required: true },

    // Optional metrics (corrected spelling)
    totalOrders: { type: String, default: "0" },
    totalSpend: { type: String, default: "0" },
    successfulOrder: { type: String, default: "0" },
    canceledOrder: { type: String, default: "0" },
  },
  {
    timestamps: true,
  }
);

const Customer =
  models.Customer || model<ICustomer>("Customer", CustomerSchema);

export default Customer;
