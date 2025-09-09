"use server";

import { ProductParams } from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Product, { IProduct } from "../database/models/product.model";
import axios from "axios";

export const createProduct = async (params: ProductParams) => {
  try {
    await connectToDatabase();
    const newProduct = await Product.create(params);
    return JSON.parse(JSON.stringify(newProduct));
  } catch (error) {
    handleError(error);
  }
};

export const getAllProducts = async () => {
  try {
    await connectToDatabase();

    const localProducts = await Product.find();
    const parsedLocalProducts = JSON.parse(JSON.stringify(localProducts));

    let externalProducts: IProduct[] = [];
    try {
      const response = await axios.get(
        "https://dropandshipping.com/api/products",
        {
          headers: {
            Authorization: `Bearer ${process.env.PRODUCTS_API_KEY}`,
          },
        }
      );

      if (Array.isArray(response.data.products)) {
        externalProducts = response.data.products;
      } else {
        console.warn(
          "External products response format unexpected:",
          response.data
        );
      }
    } catch (Error) {
      console.warn("Error fetching external products:", Error);
    }

    return [...parsedLocalProducts, ...externalProducts];
  } catch (error) {
    handleError(error);
    return [];
  }
};

export const getProductById = async (productId: string) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId);

    if (!product) {
      return null;
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    handleError(error);
  }
};

export const getProductsBySubCategory = async (subCategory: string) => {
  try {
    await connectToDatabase();

    const products = await Product.find({ subCategory });

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
