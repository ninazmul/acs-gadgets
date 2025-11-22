import HomeClient from "@/components/shared/HomeClient";
import { getAllBanners } from "@/lib/actions/banner.actions";
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

  // Fetch products via internal API for each subcategory
  const productsBySubcategory = await Promise.all(
    subcategories.map(async (subcategory) => {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/products?subCategory=${encodeURIComponent(subcategory)}&limit=10`,
        {
          cache: "no-store",
          headers: {
            "x-api-key": process.env.INTERNAL_API_KEY || "",
          },
        }
      );

      const data = await res.json();
      return { subcategory, products: data.products || ([] as IProductDTO[]) };
    })
  );

  return (
    <HomeClient
      banners={banners as IBanner[]}
      productsBySubcategory={productsBySubcategory}
    />
  );
}
