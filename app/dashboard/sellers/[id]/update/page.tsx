import UpdateSellerForm from "@/app/dashboard/components/UpdateSellerForm";
import { getSellerById } from "@/lib/actions/seller.actions";
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

  const seller = await getSellerById(id);
  if (!seller) redirect("/dashboard/sellers");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Update Seller Account</h2>
      <UpdateSellerForm
        type="Update"
        seller={seller}
        sellerId={id}
        email={email}
      />
    </div>
  );
};

export default UpdatePage;
