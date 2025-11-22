import HomeClient from "@/components/shared/HomeClient";
import { getAllBanners } from "@/lib/actions/banner.actions";
import { getFilteredProducts } from "@/lib/actions/product.actions";
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
  const banners = await getAllBanners();

  const productsBySubcategory = await Promise.all(
    subcategories.map(async (subcategory) => {
      const { products } = await getFilteredProducts({
        subCategory: subcategory,
        limit: 10,
        page: 1,
      });

      return { subcategory, products: products as IProductDTO[] };
    })
  );

  return (
    <HomeClient
      banners={banners as IBanner[]}
      productsBySubcategory={productsBySubcategory}
    />
  );
}
