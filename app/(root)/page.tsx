import HomeClient from "@/components/shared/HomeClient";
import { getAllBanners } from "@/lib/actions/banner.actions";
import { getProductsBySubCategory } from "@/lib/actions/product.actions";
import { IBanner } from "@/lib/database/models/banner.model";
import { IProductDTO } from "@/lib/database/models/product.model";

const subcategories = [
  "New Arrival",
  "Featured",
  "Best Seller",
  "Trending",
  "Limited Edition",
  "Exclusive",
  "Top Rated",
  "On Sale",
  "Flash Deal",
  "Clearance",
  "Back in Stock",
  "Hot Deal",
  "Editor's Pick",
  "Weekly Highlight",
  "Seasonal Offer",
  "Recommended",
  "Gift Idea",
  "Customer Favorite",
];

export default async function Home() {
  // Fetch all data in parallel (server-side)
  const [banners, productsBySubcategory] = await Promise.all([
    getAllBanners(),
    Promise.all(
      subcategories.map(async (subcategory) => {
        const products = await getProductsBySubCategory(subcategory);
        return { subcategory, products };
      })
    ),
  ]);

  return (
    <HomeClient
      banners={banners as IBanner[]}
      productsBySubcategory={
        productsBySubcategory as { subcategory: string; products: IProductDTO[] }[]
      }
    />
  );
}
