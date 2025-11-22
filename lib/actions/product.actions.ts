"use server";

import { ProductParams } from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Product, {
  IProduct,
  IProductDTO,
} from "../database/models/product.model";
import axios from "axios";

interface FilterParams {
  search?: string;
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "lowToHigh" | "highToLow" | null;
  page?: number;
  limit?: number;
}

// Define type for external API product
interface IExternalProduct {
  _id: string;
  title: string;
  description: string;
  images: { imageUrl: string; _id?: string }[];
  price: string;
  suggestedPrice: string;
  oldPrice?: string;
  stock: string;
  category: string;
  subCategory?: string[];
  brand?: string;
  features?: string[];
  sku: string;
  variations?: { name: string; value: string; additionalPrice?: string }[];
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export const createProduct = async (params: ProductParams) => {
  try {
    await connectToDatabase();

    const productData = { ...params, source: "local" };

    const newProduct = await Product.create(productData);
    return JSON.parse(JSON.stringify(newProduct));
  } catch (error) {
    handleError(error);
  }
};

// --- Fetch all products ---
export const getAllProducts = async (): Promise<IProductDTO[]> => {
  try {
    await connectToDatabase();

    // Local products
    const localProducts = await Product.find().sort({ createdAt: -1 }).lean();
    const formattedLocal: IProductDTO[] = JSON.parse(
      JSON.stringify(localProducts)
    ).map((p: IExternalProduct) => ({ ...p, source: "local" }));

    // External products
    let externalProducts: IProductDTO[] = [];
    try {
      const response = await axios.get(
        "https://dropandshipping.com/api/products",
        {
          headers: { "x-api-key": process.env.PRODUCTS_API_KEY },
        }
      );
      const data = response.data;
      const productsArray = Array.isArray(data) ? data : data?.products || [];
      externalProducts = productsArray.map((item: IExternalProduct) => ({
        _id: item._id,
        title: item.title,
        description: item.description,
        images: item.images || [],
        price:
          !item.suggestedPrice || item.suggestedPrice === item.price
            ? (parseFloat(item.price) + 200).toString()
            : (parseFloat(item.suggestedPrice) + 100).toString(),
        oldPrice: item.oldPrice || "",
        buyingPrice: item.price || "",
        stock: item.stock || "0",
        category: item.category || "",
        subCategory: item.subCategory || [],
        brand: item.brand || "",
        features: item.features || [],
        sku: item.sku || "",
        variations: item.variations || [],
        link: item.link || "",
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        source: "external",
      }));
    } catch (err) {
      console.error("Failed to fetch external products:", err);
    }

    return [...formattedLocal, ...externalProducts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleError(error);
    return [];
  }
};

// --- Get product by ID ---
export const getLocalProductById = async (
  productId: string
): Promise<(IProduct & { source: "local" }) | null> => {
  try {
    await connectToDatabase();

    // Get plain JS object from Mongoose
    const localProduct = await Product.findById(productId)
      .lean<IProduct>()
      .exec();

    if (!localProduct) return null;

    // Convert to plain object and add source
    const fullProduct: IProduct & { source: "local" } = {
      ...JSON.parse(JSON.stringify(localProduct)),
      source: "local",
    };

    return fullProduct;
  } catch (error) {
    handleError(error);
    return null;
  }
};

export async function getFilteredProducts({
  search = "",
  category = "",
  subCategory = "",
  minPrice = NaN,
  maxPrice = NaN,
  sort = null,
  page = 1,
  limit = 32,
}: FilterParams): Promise<{ products: IProductDTO[]; totalCount: number }> {
  await connectToDatabase();

  // --- 1) FETCH LOCAL PRODUCTS (NO FILTERS IN DB) ---
  const localProductsRaw = await Product.find().lean<IProduct[]>();
  const localProducts: IProductDTO[] = localProductsRaw.map((p) => ({
    ...p,
    price: Number(p.price),
    source: "local",
  }));

  // --- 2) FETCH EXTERNAL PRODUCTS ---
  let externalProducts: IProductDTO[] = [];
  try {
    const response = await axios.get(
      "https://dropandshipping.com/api/products",
      {
        headers: { "x-api-key": process.env.PRODUCTS_API_KEY },
      }
    );

    const data = response.data;
    const productsArray = Array.isArray(data) ? data : data?.products || [];

    externalProducts = productsArray.map((item: IExternalProduct) => ({
      _id: item._id,
      title: item.title,
      description: item.description,
      images: item.images || [],
      price:
        !item.suggestedPrice || item.suggestedPrice === item.price
          ? parseFloat(item.price) + 200
          : parseFloat(item.suggestedPrice) + 100,
      buyingPrice: item.price || "",
      oldPrice: item.oldPrice || "",
      stock: item.stock || "0",
      category: item.category || "",
      subCategory: item.subCategory || [],
      brand: item.brand || "",
      features: item.features || [],
      sku: item.sku || "",
      variations: item.variations || [],
      link: item.link || "",
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      source: "external",
    }));
  } catch (error) {
    console.error("EXTERNAL FETCH FAILED:", error);
  }

  // --- 3) MERGE PRODUCTS ---
  let products = [...localProducts, ...externalProducts];

  // --- 4) APPLY FILTERS IN JS ---

  // 🔍 Search filter
  if (search.trim()) {
    const terms = search.trim().split(/\s+/i);
    products = products.filter((p) =>
      terms.every((word) =>
        [p.title, p.sku, p.brand, p.category, ...(p.subCategory || [])]
          .join(" ")
          .toLowerCase()
          .includes(word.toLowerCase())
      )
    );
  }

  // 🏷 Category filter
  if (category) {
    const cats = category.split(",");
    products = products.filter((p) => cats.includes(p.category));
  }

  // 🏷 Sub-category filter
  if (subCategory) {
    const subs = subCategory.split(",");
    products = products.filter((p) =>
      (p.subCategory || []).some((sc) => subs.includes(sc))
    );
  }

  // 💰 Price filter
  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    products = products.filter((p) => {
      const price = Number(p.price);
      if (!isNaN(minPrice) && price < minPrice) return false;
      if (!isNaN(maxPrice) && price > maxPrice) return false;
      return true;
    });
  }

  // --- 5) SORTING ---
  if (sort === "lowToHigh") {
    products.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === "highToLow") {
    products.sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    products.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // --- 6) PAGINATION ---
  const totalCount = products.length;
  const startIndex = (page - 1) * limit;
  const paginated = products.slice(startIndex, startIndex + limit);

  return {
    products: paginated,
    totalCount,
  };
}

export const getProductById = async (
  productId: string
): Promise<IProductDTO | null> => {
  try {
    await connectToDatabase();

    // 1️⃣ Try local DB first
    const localProduct = await Product.findById(productId)
      .lean<IProduct>()
      .exec();
    if (localProduct) {
      return { ...JSON.parse(JSON.stringify(localProduct)), source: "local" };
    }

    // 2️⃣ Fallback: fetch all external products and filter by ID
    try {
      const response = await axios.get(
        "https://dropandshipping.com/api/products/",
        {
          headers: { "x-api-key": process.env.PRODUCTS_API_KEY },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.products || [];
      const item: IExternalProduct | undefined = data.find(
        (p: IExternalProduct) => p._id === productId
      );

      if (!item) return null;

      return {
        _id: item._id,
        title: item.title,
        description: item.description,
        images: (item.images || []).map((img, index) => ({
          _id: img._id || `external-${index}`,
          imageUrl: img.imageUrl,
        })),
        price:
          !item.suggestedPrice || item.suggestedPrice === item.price
            ? (parseFloat(item.price) + 200).toString()
            : (parseFloat(item.suggestedPrice) + 100).toString(),
        oldPrice: item.oldPrice || "",
        buyingPrice: item.price || "",
        stock: item.stock || "0",
        category: item.category || "",
        subCategory: item.subCategory || [],
        brand: item.brand || "",
        features: item.features || [],
        sku: item.sku || "",
        variations: item.variations || [],
        link: item.link || "",
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        source: "external",
      };
    } catch (err) {
      console.error("Failed to fetch external products:", err);
      return null;
    }
  } catch (error) {
    handleError(error);
    return null;
  }
};

// --- Get products by subCategory ---
export const getProductsBySubCategory = async (subCategory: string) => {
  try {
    await connectToDatabase();

    // Local products
    const localProducts = await Product.find({ subCategory })
      .sort({ createdAt: -1 })
      .lean();
    const formattedLocal: IProductDTO[] = JSON.parse(
      JSON.stringify(localProducts)
    ).map((p: IExternalProduct) => ({ ...p, source: "local" }));

    // External products
    let externalProducts: IProductDTO[] = [];
    try {
      const response = await axios.get(
        "https://dropandshipping.com/api/products",
        {
          headers: { "x-api-key": process.env.PRODUCTS_API_KEY },
        }
      );
      const data = response.data;
      const productsArray = Array.isArray(data) ? data : data?.products || [];
      externalProducts = productsArray
        .filter((p: IExternalProduct) => p.subCategory?.includes(subCategory))
        .map((item: IExternalProduct) => ({
          _id: item._id,
          title: item.title,
          description: item.description,
          images: item.images || [],
          price:
            !item.suggestedPrice || item.suggestedPrice === item.price
              ? (parseFloat(item.price) + 200).toString()
              : (parseFloat(item.suggestedPrice) + 100).toString(),
          oldPrice: item.oldPrice || "",
          buyingPrice: item.price || "",
          stock: item.stock || "0",
          category: item.category || "",
          subCategory: item.subCategory || [],
          brand: item.brand || "",
          features: item.features || [],
          sku: item.sku || "",
          variations: item.variations || [],
          link: item.link || "",
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          source: "external",
        }));
    } catch (err) {
      console.error("Failed to fetch external products:", err);
    }

    return [...formattedLocal, ...externalProducts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const updateProduct = async (
  productId: string,
  updateData: Partial<ProductParams>
) => {
  try {
    await connectToDatabase();

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw new Error("Product not found");
    }

    return JSON.parse(JSON.stringify(updatedProduct));
  } catch (error) {
    handleError(error);
  }
};

export const decreaseProductQuantity = async (
  productId: string,
  orderedQuantity: number
) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const currentStock = Number(product.stock);

    if (isNaN(currentStock)) {
      throw new Error("Invalid stock value");
    }

    if (currentStock <= 0) {
      throw new Error("Product is out of stock");
    }

    const newStock = Math.max(0, currentStock - orderedQuantity);

    product.stock = newStock.toString();

    const updatedProduct = await product.save();

    return JSON.parse(JSON.stringify(updatedProduct));
  } catch (error) {
    handleError(error);
  }
};

export async function searchProducts(query: string) {
  if (!query) return [];

  try {
    const regex = new RegExp(query, "i");
    const products = await getAllProducts();

    const matched = products.filter((p) => regex.test(p.title)).slice(0, 10);

    return JSON.parse(JSON.stringify(matched));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export const deleteProduct = async (productId: string) => {
  try {
    await connectToDatabase();

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      throw new Error("Product not found");
    }

    return { message: "Product deleted successfully" };
  } catch (error) {
    handleError(error);
  }
};
