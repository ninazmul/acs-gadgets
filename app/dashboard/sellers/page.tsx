import { Button } from "@/components/ui/button";
import { getAllSellers, getSellerByEmail } from "@/lib/actions/seller.actions";
import SellerTable from "../components/SellerTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import SellerForm from "../components/SellerForm";
import SellerDetailsView from "@/components/shared/SellerDetailsView";
import { getOrdersByEmail } from "@/lib/actions/order.actions";
import { getCustomersByEmail } from "@/lib/actions/customer.actions";
import { getPaymentsByEmail } from "@/lib/actions/payment.actions";
import DashboardStats from "../components/DashboardStats";
import CustomerStats from "../components/CustomerStats";
import { getSetting } from "@/lib/actions/setting.actions";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const seller = await getSellerByEmail(email);
  const sellers = adminStatus ? await getAllSellers() : [];

  let orders = [];
  let customers = [];
  let payments = [];

  if (seller) {
    orders = await getOrdersByEmail(seller.email);
    customers = await getCustomersByEmail(seller.email);
    payments = await getPaymentsByEmail(seller.email);
  }

  const setting = await getSetting();

  return (
    <>
      {adminStatus ? (
        <section className="py-2 md:py-5">
          <div className="wrapper flex flex-wrap justify-between items-center">
            <h3 className="text-3xl font-bold text-center sm:text-left">
              All Sellers
            </h3>
            <a href={"/dashboard/sellers/create"} className="w-full md:w-max">
              <Button size="lg" className="rounded-full w-full">
                Add Seller
              </Button>
            </a>
          </div>
          <div className="wrapper my-8">
            <SellerTable sellers={sellers} />
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto py-6 px-4">
          {!seller ? (
            <>
              <h1 className="text-3xl font-semibold mb-6">
                Register as a Seller
              </h1>
              <SellerForm type="Create" email={email} setting={setting} />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold mb-6">
                Your Seller Profile
              </h1>
              <SellerDetailsView seller={seller} />
              <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Financial Overview</h2>
                <DashboardStats orders={orders} payments={payments} />
              </div>

              <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Customer Overview</h2>
                <CustomerStats customers={customers} />
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
};

export default Page;
