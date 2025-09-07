import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { getAllPayments, getPaymentsByEmail } from "@/lib/actions/payment.actions";
import { getAdminRole, isAdmin } from "@/lib/actions/admin.actions";
import { redirect } from "next/navigation";
import JsonToExcel from "../components/JsonToExcel";
import PaymentForm from "../components/PaymentForm";
import PaymentTable from "../components/PaymentTable";

const Page = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const role = adminStatus ? await getAdminRole(email) : null;

  if (adminStatus && role !== "Admin") {
    redirect("/dashboard");
  }

  const payments = adminStatus
      ? await getAllPayments()
      : await getPaymentsByEmail(email);

  return (
    <>
      <section className=" py-2 md:py-5">
        <Sheet>
          <div className="wrapper flex flex-wrap justify-between items-center gap-4 mx-auto">
            <div className="flex items-center gap-2">
              <h3 className="text-3xl font-bold text-center sm:text-left">
                Payment Withdraw
              </h3>
              <JsonToExcel data={payments} fileName="payment.xlsx" />
            </div>
            <SheetTrigger className="w-full md:w-max">
              <Button size="lg" className="rounded-full w-full">
                Request Payment
              </Button>
            </SheetTrigger>
          </div>

          <SheetContent className="bg-white">
            <SheetHeader>
              <SheetTitle>Add a Request</SheetTitle>
              <SheetDescription>
                Use this form to Request for payment withdrawal. Ensure the
                information provided is accurate and complete, adhering to the
                system&apos;s guidelines for proper record management and
                organization.
              </SheetDescription>
            </SheetHeader>
            <div className="py-5">
              <PaymentForm type="Create" email={email} />
            </div>
          </SheetContent>
        </Sheet>
      </section>

      <div className="wrapper my-8">
        <PaymentTable
          payments={payments}
          isAdmin={adminStatus}
        />
      </div>
    </>
  );
};

export default Page;
