import { Suspense } from "react";
import ProductFiltersClient from "@/components/shared/ProductFiltersClient";
import Loader from "@/components/shared/Loader";
import { getAllCategories } from "@/lib/actions/category.actions";

export default async function ProductPage() {
  // Provide your API key here
  const PRODUCTS_API_KEY = process.env.PRODUCTS_API_KEY!;

  const categories = await getAllCategories();

  return (
    <Suspense fallback={<Loader />}>
      <ProductFiltersClient
        apiKey={PRODUCTS_API_KEY}
        categories={categories}
      />
    </Suspense>
  );
}
