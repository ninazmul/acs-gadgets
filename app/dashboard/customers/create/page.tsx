import { auth } from "@clerk/nextjs/server";
import CustomerForm from "../../components/CustomerForm";
import { getUserEmailById } from "@/lib/actions/user.actions";

const CreatePage = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Add a New Customer</h2>
      <CustomerForm type="Create" email={email} />
    </section>
  );
};

export default CreatePage;
