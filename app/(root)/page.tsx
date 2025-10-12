import Link from "next/link";
import BannerCarousel from "@/components/shared/BannerCarousel";
import { getAllBanners } from "@/lib/actions/banner.actions";
import { getProductsBySubCategory } from "@/lib/actions/product.actions";
import "swiper/css";
import "swiper/css/navigation";
import ProductSlider from "@/components/shared/ProductSlider";

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
      const products = await getProductsBySubCategory(subcategory);
      return { subcategory, products };
    })
  );

  return (
    <div>
      {/* Banners */}
      <section id="banners">
        {banners?.length > 0 ? (
          <BannerCarousel banners={banners} />
        ) : (
          <div className="text-center text-gray-500">No banners found.</div>
        )}
      </section>

      {/* Product rows by subcategory */}
      <section id="products">
        {productsBySubcategory.map(
          ({ subcategory, products }) =>
            products.length > 0 && (
              <div key={subcategory} className="my-10 w-full">
                <div className="flex justify-between items-center px-4 mb-4">
                  {/* Subcategory Title with animated underline */}
                  <Link
                    href={`/products?subCategory=${encodeURIComponent(
                      subcategory
                    )}`}
                    className="group relative inline-block text-xl font-semibold"
                  >
                    {subcategory}
                    <span
                      className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-blue-500 to-purple-500 
                      transition-all duration-300 group-hover:w-full"
                    ></span>
                  </Link>

                  {/* View All Link */}
                  <Link
                    href={`/products?subCategory=${encodeURIComponent(
                      subcategory
                    )}`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="px-4">
                  <ProductSlider products={products} />
                </div>
              </div>
            )
        )}
      </section>
    </div>
  );
}
