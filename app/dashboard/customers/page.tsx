import { Button } from "@/components/ui/button";
import {
  getAllCustomers,
  getCustomersByEmail,
} from "@/lib/actions/customer.actions";
import CustomerTable from "../components/CustomerTable";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getAdminRole, isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const role = adminStatus ? await getAdminRole(email) : null;

  if (adminStatus && role !== "Admin") {
    redirect("/dashboard");
  }

  const customers = adminStatus
    ? await getAllCustomers()
    : await getCustomersByEmail(email);

  return (
    <>
      <section className="py-2 md:py-5">
        <div className="wrapper flex flex-wrap justify-between items-center">
          <h3 className="text-3xl font-bold text-center sm:text-left">
            All Customers
          </h3>
          <a href={"/dashboard/customers/create"} className="w-full md:w-max">
            <Button size="lg" className="rounded-full w-full">
              Add Customer
            </Button>
          </a>
        </div>
      </section>

      <div className="wrapper my-8">
        <CustomerTable customers={customers} />
      </div>
    </>
  );
};

export default Page;
