"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { IProduct } from "@/lib/database/models/product.model";
import ProductCard from "@/components/shared/ProductCard";

interface ProductFiltersClientProps {
  rawProducts: IProduct[];
}

export default function ProductFiltersClient({
  rawProducts,
}: ProductFiltersClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filteredProducts, setFilteredProducts] =
    useState<IProduct[]>(rawProducts);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    []
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const productsPerPage = 32;
  const pageFromURL = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(
    isNaN(pageFromURL) ? 1 : pageFromURL
  );

  useEffect(() => {
    const pageFromURL = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(isNaN(pageFromURL) ? 1 : pageFromURL);
  }, [searchParams]);

  useEffect(() => {
    const searchFromURL = searchParams.get("search") || "";
    const categoryFromURL = searchParams.get("category");
    const subCategoryFromURL = searchParams.get("subCategory");
    const minFromURL = searchParams.get("min") || "";
    const maxFromURL = searchParams.get("max") || "";

    setSearch(searchFromURL);

    if (categoryFromURL) {
      setSelectedCategories(categoryFromURL.split(","));
    } else {
      setSelectedCategories([]);
    }

    if (subCategoryFromURL) {
      setSelectedSubCategories(subCategoryFromURL.split(","));
    } else {
      setSelectedSubCategories([]);
    }

    setMinPrice(minFromURL);
    setMaxPrice(maxFromURL);
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    let filtered = rawProducts;

    // Search
    if (search.trim()) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // SubCategory filter (array check)
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter((product) =>
        product.subCategory?.some((sub: string) =>
          selectedSubCategories.includes(sub)
        )
      );
    }

    // Price filter
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      filtered = filtered.filter((product) => parseFloat(product.price) >= min);
    }
    if (!isNaN(max)) {
      filtered = filtered.filter((product) => parseFloat(product.price) <= max);
    }

    setFilteredProducts(filtered);
  }, [
    rawProducts,
    search,
    selectedCategories,
    selectedSubCategories,
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    const timeout = setTimeout(() => applyFilters(), 300);
    return () => clearTimeout(timeout);
  }, [applyFilters, search]);

  // Utility: compare arrays ignoring order
  const arraysEqualIgnoreOrder = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    for (let i = 0; i < sortedA.length; i++)
      if (sortedA[i] !== sortedB[i]) return false;
    return true;
  };

  // State to track last applied filters
  const [lastFilters, setLastFilters] = useState({
    search,
    categories: selectedCategories,
    subCategories: selectedSubCategories,
    minPrice,
    maxPrice,
  });

  useEffect(() => {
    const filtersChanged =
      lastFilters.search !== search ||
      lastFilters.minPrice !== minPrice ||
      lastFilters.maxPrice !== maxPrice ||
      !arraysEqualIgnoreOrder(lastFilters.categories, selectedCategories) ||
      !arraysEqualIgnoreOrder(lastFilters.subCategories, selectedSubCategories);

    if (filtersChanged) {
      setCurrentPage(1); // reset page only if filters changed
      setLastFilters({
        search,
        categories: selectedCategories,
        subCategories: selectedSubCategories,
        minPrice,
        maxPrice,
      });
    }
  }, [
    search,
    selectedCategories,
    selectedSubCategories,
    minPrice,
    maxPrice,
    lastFilters,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedCategories.length > 0)
      params.set("category", selectedCategories.join(","));
    if (selectedSubCategories.length > 0)
      params.set("subCategory", selectedSubCategories.join(","));
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);

    params.set("page", String(currentPage));

    router.replace(`/products?${params.toString()}`);
  }, [
    search,
    selectedCategories,
    selectedSubCategories,
    minPrice,
    maxPrice,
    currentPage,
    router,
  ]);

  const categories = useMemo(
    () => Array.from(new Set(rawProducts.map((p) => p.category))),
    [rawProducts]
  );
  const subCategories = useMemo(
    () =>
      Array.from(
        new Set(rawProducts.flatMap((p) => p.subCategory || []).filter(Boolean))
      ),
    [rawProducts]
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubCategoryChange = (subCategory: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategory)
        ? prev.filter((s) => s !== subCategory)
        : [...prev, subCategory]
    );
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const Pagination = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisible = 5; // pages around current
    const ellipsis = "...";

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1); // first page

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pageNumbers.push(ellipsis);
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      if (end < totalPages - 1) pageNumbers.push(ellipsis);

      pageNumbers.push(totalPages); // last page
    }

    return (
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </Button>

        {pageNumbers.map((num, index) =>
          num === ellipsis ? (
            <span key={index} className="px-2 py-1 text-gray-500">
              {ellipsis}
            </span>
          ) : (
            <Button
              key={index}
              variant={currentPage === num ? "default" : "outline"}
              onClick={() => setCurrentPage(Number(num))}
            >
              {num}
            </Button>
          )
        )}

        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  const FilterContent = () => (
    <div className="space-y-6 p-4">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium">
          Search
        </label>
        <Input
          id="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-1 w-full"
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium">Price Range</label>
        <div className="mt-2 flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium">Category</label>
        <ul className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <li key={cat} className="flex items-center">
              <input
                type="checkbox"
                id={cat}
                name="category"
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label htmlFor={cat} className="ml-2 text-sm capitalize">
                {cat}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* SubCategory */}
      <div>
        <label className="block text-sm font-medium">Sub Category</label>
        <ul className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
          {subCategories.map((sub) => (
            <li key={sub} className="flex items-center">
              <input
                type="checkbox"
                id={sub}
                name="subCategory"
                checked={selectedSubCategories.includes(sub)}
                onChange={() => handleSubCategoryChange(sub)}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label htmlFor={sub} className="ml-2 text-sm capitalize">
                {sub}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Clear Filters */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => {
          setSearch("");
          setSelectedCategories([]);
          setSelectedSubCategories([]);
          setMinPrice("");
          setMaxPrice("");
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <section className="wrapper py-6">
      {/* Mobile Filter Button */}
      <div className="lg:hidden m-4 flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
            </SheetHeader>
            {FilterContent()}
          </SheetContent>
        </Sheet>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
        {/* Sidebar */}
        <aside className="hidden lg:block border rounded-md p-4 bg-white h-fit sticky top-4">
          <h3 className="text-lg font-semibold mb-4">Filter</h3>
          {FilterContent()}
        </aside>

        {/* Products */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-6">
            {currentProducts.length === 0 ? (
              <p className="col-span-full text-center py-20 text-gray-500">
                No products found.
              </p>
            ) : (
              currentProducts.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))
            )}
          </div>

          {filteredProducts.length > productsPerPage && <Pagination />}
        </div>
      </div>
    </section>
  );
}
