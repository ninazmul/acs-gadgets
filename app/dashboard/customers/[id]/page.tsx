import { getCustomerById } from "@/lib/actions/customer.actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  params: Promise<{ id: string }>;
};

const CustomerDetails = async ({ params }: PageProps) => {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    return (
      <div className="px-4 py-10 text-center text-xl text-destructive">
        Customer not found.
      </div>
    );
  }

  return (
    <section className="px-4 py-10 space-y-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <strong>Name:</strong> {customer.name}
          </div>
          <div>
            <strong>Email:</strong> {customer.email}
          </div>
          <div>
            <strong>Phone Number:</strong> {customer.number}
          </div>
          <div>
            <strong>District:</strong> {customer.district}
          </div>
          <div>
            <strong>Address:</strong> {customer.address}
          </div>
          <div>
            <strong>Area of Delivery:</strong> {customer.areaOfDelivery}
          </div>
          <div>
            <strong>Added By:</strong> {customer.addedBy}
          </div>
          <div>
            <strong>Created At:</strong>{" "}
            {new Date(customer.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Order Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Order Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <Badge variant="secondary">
            Total Orders: {customer.totalOrders ?? 0}
          </Badge>
          <Badge className="bg-green-600 text-white">
            Successful Orders: {customer.successfulOrder ?? 0}
          </Badge>
          <Badge className="bg-red-600 text-white">
            Canceled Orders: {customer.canceledOrder ?? 0}
          </Badge>
          <Badge className="bg-blue-600 text-white">
            Total Spend: ৳{customer.totalSpend ?? 0}
          </Badge>
        </CardContent>
      </Card>
    </section>
  );
};

export default CustomerDetails;
