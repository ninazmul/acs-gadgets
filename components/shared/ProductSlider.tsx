"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Navigation, Autoplay } from "swiper/modules";
import { IProduct } from "@/lib/database/models/product.model";
import SliderCard from "./SliderCard";

interface Props {
  products: IProduct[];
  isSeller?: boolean;
  isAdmin?: boolean;
}

export default function ProductSlider({ products, isSeller, isAdmin }: Props) {
  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      navigation
      loop={true}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      spaceBetween={16}
      breakpoints={{
        0: { slidesPerView: 1.2 },
        640: { slidesPerView: 1.5 },
        768: { slidesPerView: 2.5 },
        1024: { slidesPerView: 4 },
      }}
      className="!py-4"
    >
      {products.map((product) => (
        <SwiperSlide key={product._id} className="h-auto">
          <div className="h-full border p-4 rounded-md">
            <SliderCard {...product} isSeller={isSeller} isAdmin={isAdmin} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
