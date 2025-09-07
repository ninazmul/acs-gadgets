"use client";

import Image from "next/image";

type ProductCardProps = {
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

const ProductCard = ({
  _id,
  title,
  price,
  category,
  images,
  isSeller,
  isAdmin,
}: ProductCardProps) => {
  const firstImage = images?.[0]?.imageUrl || "/assets/images/placeholder.png";
  const secondImage = images?.[1]?.imageUrl || firstImage;

  return (
    <a
      href={`/products/${_id}`}
      className="group p-2 lg:p-4 border rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-transform transform hover:scale-[1.02] duration-300"
    >
      <div className="w-full h-24 md:h-36 lg:h-64 relative overflow-hidden rounded-md bg-gray-100">
        {/* First Image */}
        <Image
          src={firstImage}
          alt={title}
          fill
          className="object-contain transition-opacity duration-300 ease-in-out group-hover:opacity-0"
        />
        {/* Second Image on hover */}
        <Image
          src={secondImage}
          alt={title + " alt"}
          fill
          className="object-contain transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
        />
      </div>
      <div className="p-2 lg:p-4 space-y-1">
        <h4 className="font-semibold text-sm md:text-md lg:text-lg line-clamp-2">{title}</h4>
        {(isAdmin || isSeller) && (
          <p className="text-primary font-bold">৳{price}</p>
        )}
        <p className="text-xs text-gray-500">{category}</p>
      </div>
    </a>
  );
};

export default ProductCard;
