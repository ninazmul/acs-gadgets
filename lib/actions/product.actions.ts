"use server";

import { ProductParams } from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Product, {
  IProduct,
  IProductDTO,
} from "../database/models/product.model";

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
    const newProduct = await Product.create(params);
    return JSON.parse(JSON.stringify(newProduct));
  } catch (error) {
    handleError(error);
  }
};

// export const getAllProducts = async () => {
//   try {
//     await connectToDatabase();

//     const products = await Product.find().sort({ createdAt: -1 }).lean();

//     return JSON.parse(JSON.stringify(products));
//   } catch (error) {
//     handleError(error);
//   }
// };

export const getAllProducts = async (): Promise<IProductDTO[]> => {
  try {
    await connectToDatabase();

    // Local products (plain objects)
    const localProducts = await Product.find().sort({ createdAt: -1 }).lean();
    const formattedLocal: IProductDTO[] = JSON.parse(
      JSON.stringify(localProducts)
    ).map((p: Omit<IProduct, keyof Document>) => ({ ...p, source: "local" }));

    // External products
    const externalResponse = await fetch(
      "https://dropandshipping.com/api/products",
      {
        headers: { "x-api-key": process.env.PRODUCTS_API_KEY || "" },
        cache: "no-store",
      }
    );

    let externalProducts: IProductDTO[] = [];
    if (externalResponse.ok) {
      const data: IExternalProduct[] = await externalResponse.json();

      externalProducts = data.map((item) => ({
        _id: item._id,
        title: item.title,
        description: item.description,
        images: item.images || [],
        price: item.suggestedPrice || "",
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
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        source: "external",
      }));
    }

    const allProducts: IProductDTO[] = [...formattedLocal, ...externalProducts];

    allProducts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allProducts;
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const getProductById = async (productId: string) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId).lean();

    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    handleError(error);
  }
};

export const getProductsBySubCategory = async (subCategory: string) => {
  try {
    await connectToDatabase();

    const products = await Product.find({ subCategory })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    handleError(error);
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
