import ProductFiltersClient from "@/components/shared/ProductFiltersClient";
import { getAllProducts } from "@/lib/actions/product.actions";

export default async function ProductPage() {

  const products = (await getAllProducts()) || [];

  return (
    <div >
      <ProductFiltersClient
        rawProducts={products}
      />
    </div>
  );
}
