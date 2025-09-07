"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

type Seller = {
  _id: string;
  name: string;
  email: string;
  number: string;
  district: string;
  address: string;
  shopName: string;
  shopLogo?: string;
  totalOrders?: string;
  successfulOrder?: string;
  canceledOrder?: string;
  totalSpend?: string;
  totalPaid?: string;
  totalDue?: string;
  createdAt: string | Date;
};

interface SellerDetailsViewProps {
  seller: Seller;
}

const SellerDetailsView = ({ seller }: SellerDetailsViewProps) => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Profile Card */}
      <Card className="p-6 shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-6">
            Seller Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Logo / Avatar */}
            <div className="flex-shrink-0">
              {seller.shopLogo ? (
                <Image
                  src={seller.shopLogo}
                  alt={`${seller.shopName} Logo`}
                  width={160}
                  height={160}
                  className="rounded-full border border-gray-300 shadow-md"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-400 text-xl font-semibold">
                  No Logo
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-grow space-y-4 text-gray-800">
              <h2 className="text-2xl font-semibold">{seller.shopName}</h2>
              <p className="text-lg">{seller.name}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Email:</span> {seller.email}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {seller.number}
                </div>
                <div>
                  <span className="font-semibold">District:</span>{" "}
                  {seller.district}
                </div>
                <div>
                  <span className="font-semibold">Address:</span>{" "}
                  {seller.address}
                </div>
                <div>
                  <span className="font-semibold">Created At:</span>{" "}
                  {new Date(seller.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Statistics */}
      <Card className="p-6 shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold mb-4">
            Order Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <Badge variant="secondary" className="px-5 py-3 text-base">
              Total Orders: {seller.totalOrders ?? 0}
            </Badge>
            <Badge className="bg-green-600 text-white px-5 py-3 text-base">
              Successful Orders: {seller.successfulOrder ?? 0}
            </Badge>
            <Badge className="bg-red-600 text-white px-5 py-3 text-base">
              Canceled Orders: {seller.canceledOrder ?? 0}
            </Badge>
            <Badge className="bg-blue-600 text-white px-5 py-3 text-base">
              Total Spend: ৳{seller.totalSpend ?? 0}
            </Badge>
            <Badge className="bg-indigo-600 text-white px-5 py-3 text-base">
              Total Paid: ৳{seller.totalPaid ?? 0}
            </Badge>
            <Badge className="bg-yellow-600 text-white px-5 py-3 text-base">
              Total Due: ৳{seller.totalDue ?? 0}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a href={`/dashboard/sellers/${seller._id}`} className="flex-1">
          <Button
            size="lg"
            className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <Eye /> Go to Dashboard
          </Button>
        </a>
        <a href={`/dashboard/sellers/${seller._id}/update`} className="flex-1">
          <Button
            size="lg"
            variant="outline"
            className="w-full rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            <Pencil /> Edit Profile
          </Button>
        </a>
      </div>
    </section>
  );
};

export default SellerDetailsView;
