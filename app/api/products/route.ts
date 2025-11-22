import { getFilteredProducts } from "@/lib/actions/product.actions";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.PRODUCTS_API_KEY;

export async function GET(req: Request) {
  // 🔒 API Key check
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);

    // 📝 Extract query params
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const subCategory = url.searchParams.get("subCategory") || "";
    const minPrice = url.searchParams.has("min")
      ? parseFloat(url.searchParams.get("min")!)
      : NaN;
    const maxPrice = url.searchParams.has("max")
      ? parseFloat(url.searchParams.get("max")!)
      : NaN;
    const sort = url.searchParams.get("sort") as "lowToHigh" | "highToLow" | null;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "32", 10);

    // 📦 Fetch filtered products (lean ensures plain objects, better performance)
    const { products: filteredProducts, totalCount } = await getFilteredProducts({
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    });

    // 🛡 Remove wholesalePrice for internal response
    const products = filteredProducts.map((p) => {
      const copy = { ...p };
      return copy;
    });

    // 🆕 Explicit no-cache headers to prevent stale edge caching
    const headers = new Headers();
    headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");

    return new NextResponse(JSON.stringify({ products, totalCount }), { headers });
  } catch (err) {
    console.error("Error fetching filtered products:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
