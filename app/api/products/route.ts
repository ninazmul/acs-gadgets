import { getAllProducts } from "@/lib/actions/product.actions";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.PRODUCTS_API_KEY;

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || apiKey !== SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
