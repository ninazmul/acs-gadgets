import { Suspense } from "react";
import ProductFiltersClient from "@/components/shared/ProductFiltersClient";
import { getAllProducts } from "@/lib/actions/product.actions";
import Loader from "@/components/shared/Loader";

export default async function ProductPage() {

  const products = await getAllProducts();

  return (
    <Suspense fallback={<Loader />}>
      <ProductFiltersClient
        rawProducts={products}
      />
    </Suspense>
  );
}
