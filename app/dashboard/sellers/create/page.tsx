import { auth } from "@clerk/nextjs/server";
import SellerForm from "../../components/SellerForm";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { getSetting } from "@/lib/actions/setting.actions";

const CreatePage = async () => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const setting = await getSetting();
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Create Seller Account</h2>
      <SellerForm type="Create" email={email} setting={setting} />
    </section>
  );
};

export default CreatePage;
