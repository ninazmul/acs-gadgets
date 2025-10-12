"use client";

import BannerCarousel from "@/components/shared/BannerCarousel";
import { getAllBanners } from "@/lib/actions/banner.actions";
import { getProductsBySubCategory } from "@/lib/actions/product.actions";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import ProductSlider from "@/components/shared/ProductSlider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IProductDTO } from "@/lib/database/models/product.model";
import { IBanner } from "@/lib/database/models/banner.model";

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

export default function Home() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [productsBySubcategory, setProductsBySubcategory] = useState<
    { subcategory: string; products: IProductDTO[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bannerData = await getAllBanners();
        setBanners(bannerData || []);

        const productData = await Promise.all(
          subcategories.map(async (subcategory) => {
            const products = await getProductsBySubCategory(subcategory);
            return { subcategory, products };
          })
        );

        setProductsBySubcategory(productData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Determine how many skeletons to show based on screen width
  const [skeletonCount, setSkeletonCount] = useState(5);

  useEffect(() => {
    const updateSkeletonCount = () => {
      if (window.innerWidth < 640) setSkeletonCount(2); // sm: <640px
      else if (window.innerWidth < 1024) setSkeletonCount(3); // md: <1024px
      else setSkeletonCount(5); // lg+
    };

    updateSkeletonCount();
    window.addEventListener("resize", updateSkeletonCount);
    return () => window.removeEventListener("resize", updateSkeletonCount);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-12"
    >
      {/* ===== Banners ===== */}
      <section id="banners" className="relative overflow-hidden">
        {loading ? (
          <div className="w-full flex gap-4 overflow-hidden">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className="aspect-[9/16] flex-1 bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : banners?.length > 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <BannerCarousel banners={banners} />
          </motion.div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            No banners found.
          </div>
        )}
      </section>

      {/* ===== Product Rows by Subcategory ===== */}
      <section id="products" className="space-y-16">
        {loading
          ? // 🔹 Product Skeleton Rows
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 space-y-6">
                {/* Subcategory title skeleton */}
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>

                {/* Simulated product slider */}
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: skeletonCount }).map((_, j) => (
                    <div
                      key={j}
                      className="w-full bg-white dark:bg-gray-900 border rounded-md p-2 lg:p-4"
                    >
                      {/* Image placeholder */}
                      <div className="w-full h-24 md:h-36 lg:h-64 bg-gray-200 dark:bg-gray-800 rounded-md mb-3 animate-pulse"></div>

                      {/* Text placeholders */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          : // 🔹 Actual Product Rows
            productsBySubcategory.map(
              ({ subcategory, products }, index) =>
                products.length > 0 && (
                  <motion.div
                    key={subcategory}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="my-10 w-full"
                  >
                    <div className="flex justify-between items-center px-4 mb-6">
                      <a
                        href={`/products?subCategory=${encodeURIComponent(
                          subcategory
                        )}`}
                        className="group relative inline-block text-2xl font-bold tracking-tight text-gray-800 dark:text-white"
                      >
                        {subcategory}
                        <motion.span
                          layoutId={`underline-${subcategory}`}
                          className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full
                          transition-all duration-500 group-hover:w-full"
                        />
                      </a>

                      <a
                        href={`/products?subCategory=${encodeURIComponent(
                          subcategory
                        )}`}
                        className="text-sm font-medium text-blue-500 hover:text-purple-500 transition-colors duration-300"
                      >
                        View All →
                      </a>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6 }}
                      className="px-4"
                    >
                      <ProductSlider products={products} />
                    </motion.div>
                  </motion.div>
                )
            )}
      </section>
    </motion.div>
  );
}
