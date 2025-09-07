"use client";

import Image from "next/image";

type SliderCardProps = {
  _id: string;
  title: string;
  price: string;
  category: string;
  images: {
    imageUrl: string;
  }[];
  isSeller?: boolean;
  isAdmin?: boolean;
};

const SliderCard = ({
  _id,
  title,
  price,
  category,
  images,
  isSeller,
  isAdmin,
}: SliderCardProps) => {
  const firstImage = images?.[0]?.imageUrl || "/assets/images/placeholder.png";
  const secondImage = images?.[1]?.imageUrl || firstImage;

  return (
    <a
      href={`/products/${_id}`}
      className="group block transition-transform transform hover:scale-[1.02] duration-300"
    >
      <div className="w-full h-64 relative overflow-hidden rounded-md">
        {/* First Image (default) */}
        <Image
          src={firstImage}
          alt={title}
          fill
          className="object-cover transition-opacity duration-300 ease-in-out group-hover:opacity-0 rounded-md"
        />
        {/* Second Image (hover) */}
        <Image
          src={secondImage}
          alt={`${title} alt`}
          fill
          className="object-cover transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100 rounded-md"
        />
      </div>
      <div className="mt-2 space-y-1 px-1">
        <h4 className="font-semibold text-base line-clamp-2">{title}</h4>
        {(isAdmin || isSeller) && (
          <p className="text-primary font-bold text-sm">৳{price}</p>
        )}
        <p className="text-xs text-gray-500">{category}</p>
      </div>
    </a>
  );
};

export default SliderCard;
