"use client";

import Link from "next/link";
import BannerCarousel from "@/components/shared/BannerCarousel";
import { getAllBanners } from "@/lib/actions/banner.actions";
import { getProductsBySubCategory } from "@/lib/actions/product.actions";
import "swiper/css";
import "swiper/css/navigation";
import ProductSlider from "@/components/shared/ProductSlider";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [productsBySubcategory, setProductsBySubcategory] = useState<
    { subcategory: string; products: IProductDTO[] }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const bannerData = await getAllBanners();
      setBanners(bannerData || []);

      const productData = await Promise.all(
        subcategories.map(async (subcategory) => {
          const products = await getProductsBySubCategory(subcategory);
          return { subcategory, products };
        })
      );

      setProductsBySubcategory(productData);
    };

    fetchData();
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
        {banners?.length > 0 ? (
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
        {productsBySubcategory.map(
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
                {/* ===== Header with Animated Title ===== */}
                <div className="flex justify-between items-center px-4 mb-6">
                  <Link
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
                  </Link>

                  <Link
                    href={`/products?subCategory=${encodeURIComponent(
                      subcategory
                    )}`}
                    className="text-sm font-medium text-blue-500 hover:text-purple-500 transition-colors duration-300"
                  >
                    View All →
                  </Link>
                </div>

                {/* ===== Product Slider ===== */}
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
