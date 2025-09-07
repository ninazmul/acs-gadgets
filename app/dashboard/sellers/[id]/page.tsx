import { getSellerById } from "@/lib/actions/seller.actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import DashboardStats from "../../components/DashboardStats";
import CustomerStats from "../../components/CustomerStats";
import { getOrdersByEmail } from "@/lib/actions/order.actions";
import { getCustomersByEmail } from "@/lib/actions/customer.actions";
import { getPaymentsByEmail } from "@/lib/actions/payment.actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

const SellerDetails = async ({ params }: PageProps) => {
  const { id } = await params;
  const seller = await getSellerById(id);

  const orders = await getOrdersByEmail(seller.email);
  const customers = await getCustomersByEmail(seller.email);
  const payments = await getPaymentsByEmail(seller.email);

  if (!seller) {
    return (
      <div className="px-4 py-10 text-center text-xl text-destructive">
        Seller not found.
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Profile Card */}
      <Card className="p-6">
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
      <Card className="mt-8 p-6">
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

      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Financial Overview</h2>
        <DashboardStats orders={orders} payments={payments} />
      </div>

      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Customer Overview</h2>
        <CustomerStats customers={customers} />
      </div>
    </section>
  );
};

export default SellerDetails;
