import { Suspense } from "react";
import ProductFiltersClient from "@/components/shared/ProductFiltersClient";
import { getAllProducts } from "@/lib/actions/product.actions";
import Loader from "@/components/shared/Loader";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { isAdmin } from "@/lib/actions/admin.actions";
import { isSeller } from "@/lib/actions/seller.actions";

export default async function ProductPage() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);
  const adminStatus = await isAdmin(email);
  const sellerStatus = await isSeller(email);

  const products = await getAllProducts();

  return (
    <Suspense fallback={<Loader />}>
      <ProductFiltersClient
        rawProducts={products}
        isSeller={sellerStatus}
        isAdmin={adminStatus}
      />
    </Suspense>
  );
}
