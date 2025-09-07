import CustomerForm from "@/app/dashboard/components/CustomerForm";
import { getCustomerById } from "@/lib/actions/customer.actions";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

const UpdatePage = async ({ params }: PageProps) => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  const { id } = await params;

  const customer = await getCustomerById(id);
  if (!customer) redirect("/dashboard/customers");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Customer</h2>
      <CustomerForm
        type="Update"
        customer={customer}
        customerId={id}
        email={email}
      />
    </div>
  );
};

export default UpdatePage;
