export const revalidate = 60;

import SellerForm from "@/app/dashboard/components/SellerForm";
import SellerDetailsView from "@/components/shared/SellerDetailsView";
import { getSellerByEmail } from "@/lib/actions/seller.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";

export default async function RegisterPage() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const seller = await getSellerByEmail(email);
  const setting = await getSetting();

  return (
    <section className="max-w-7xl mx-auto py-6 px-4">
      {!seller ? (
        <>
          <h1 className="text-3xl font-semibold mb-6">Register as a Seller</h1>
          <SellerForm type="Create" email={email} setting={setting} />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold mb-6">Your Seller Profile</h1>
          <SellerDetailsView seller={seller} />
        </>
      )}
    </section>
  );
}
