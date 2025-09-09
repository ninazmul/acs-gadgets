import ProductGallery from "@/components/shared/ProductGallery";
import ShareButton from "@/components/shared/ShareButton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProductById, getAllProducts } from "@/lib/actions/product.actions";
import ProductCard from "@/components/shared/ProductCard";
import { IProduct } from "@/lib/database/models/product.model";
import AddToCart from "@/components/shared/AddToCart";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { Cloud } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product not found",
      description: "No details available for this product",
    };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.images?.[0]?.imageUrl],
    },
  };
}

const ProductDetails = async ({ params }: PageProps) => {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.userId as string;
  const email = await getUserEmailById(userId);

  const { id } = await params;
  const product = await getProductById(id);
  const allProducts = (await getAllProducts()) || [];

  const relatedProducts = allProducts
    .filter((p: IProduct) => {
      if (p._id === id) return false;

      const categoryMatch = p.category === product.category;
      const brandMatch = p.brand === product.brand;
      const subCategoryMatch =
        p.subCategory?.some((sub) => product.subCategory?.includes(sub)) ??
        false;

      return categoryMatch || brandMatch || subCategoryMatch;
    })
    .slice(0, 12);

  if (!product) {
    return (
      <div className="px-4 py-10 text-center text-xl text-destructive">
        Product not found.
      </div>
    );
  }

  return (
    <section className="px-4 py-10 space-y-10">
      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Image Gallery */}
        <div className="md:col-span-2">
          <ProductGallery images={product.images} />
        </div>

        {/* Product Info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {/* Brand */}
              {product.brand && (
                <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full border border-red-300">
                  {product.brand}
                </span>
              )}

              {/* Category */}
              {product.category && (
                <span className="text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded-full border border-gray-300">
                  {product.category}
                </span>
              )}

              {/* Subcategories */}
              {product.subCategory?.length > 0 &&
                product.subCategory.map((sub: string, i: string) => (
                  <span
                    key={i}
                    className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-300"
                  >
                    {sub}
                  </span>
                ))}
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{product.title}</h1>
              <ShareButton
                productId={product._id}
                productName={product.title}
              />
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-green-500">Price:</h3>
              <p className="text-2xl font-semibold text-green-500">
                ৳{product.price}
              </p>
              {product.oldPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  ৳{product.oldPrice}
                </p>
              )}
            </div>
          </div>

          {/* Variations */}
          {product.variations?.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Available Variants:</p>
              <ul className="flex flex-wrap gap-2">
                {product.variations.map(
                  (variant: { name: string; value: string }, index: number) => (
                    <li
                      key={index}
                      className="px-3 py-1 border rounded text-sm bg-muted"
                    >
                      {variant.name}: {variant.value}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Features */}
          {product.features?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Features</h3>
              <ul className="list-disc list-inside font-bold text-sm">
                {product.features.map((feature: string, i: number) => (
                  <li key={i}>• {feature}</li>
                ))}
              </ul>

              <div className="my-2" />
              <Separator />
              <div className="my-2" />

              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
               bg-gray-800 text-white font-medium shadow-sm 
               hover:bg-gray-900 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <Cloud />
                <span>Access Product Media</span>
              </a>
            </div>
          )}
        </div>

        {/* Purchase Card */}
        <div className="md:col-span-2 lg:col-span-1">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Stock Info */}
              {product.stock === "0" ? (
                <p className="text-destructive font-medium">Out of Stock</p>
              ) : (
                <p className="text-green-600 font-medium">
                  In Stock {product.stock}
                </p>
              )}

              {parseInt(product.stock) > 0 && parseInt(product.stock) <= 3 && (
                <p className="text-destructive text-sm font-semibold">
                  Only {product.stock} left in stock!
                </p>
              )}

              {/* Add to Cart Button with Variation Support */}
              {product.stock !== "0" && (
                <AddToCart
                  product={product}
                  email={email}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Description</h3>
        <div
          className="
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:font-bold prose-strong:text-black
                prose-em:text-gray-800 prose-em:italic
                prose-u:underline
                prose-ul:list-disc prose-ul:pl-5
                prose-ol:list-decimal prose-ol:pl-5
                prose-li:marker:text-gray-500
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:text-gray-600 italic
                prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-pink-600
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:font-medium
                prose-img:rounded-lg prose-img:shadow-md
                prose prose-lg dark:prose-invert max-w-none mb-12
                "
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
            {relatedProducts.slice(0, 10).map((item: IProduct) => (
              <ProductCard key={item._id} {...item} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default ProductDetails;
