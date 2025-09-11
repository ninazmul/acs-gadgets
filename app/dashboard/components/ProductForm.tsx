"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useUploadThing } from "@/lib/uploadthing";
import { FileUploader } from "@/components/shared/FileUploader";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/database/models/product.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { ICategory } from "@/lib/database/models/category.model";
import Select from "react-select";
import { IBrand } from "@/lib/database/models/brand.model";
import FeatureEditor from "@/components/shared/FeatureEditor";

const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  images: z.array(
    z.object({ imageUrl: z.string().min(1, "Image URL is required") })
  ),
  price: z.string().min(1, "Price is required"),
  oldPrice: z.string().optional(),
  buyingPrice: z.string().optional(),
  stock: z.string().min(1, "Stock is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.array(z.string()).optional(),
  brand: z.string().optional(),
  features: z.array(z.string()).optional(),
  sku: z.string().min(1, "SKU is required"),
  variations: z
    .array(
      z.object({
        name: z.string().min(1, "Variation name is required"),
        value: z.string().min(1, "Variation value is required"),
        additionalPrice: z.string().optional(),
      })
    )
    .optional(),
  link: z.string().optional(),
});

type ProductFormProps = {
  type: "Create" | "Update";
  product?: IProduct;
  productId?: string;
  categories?: ICategory[];
  brands?: IBrand[];
};

const ProductForm = ({
  type,
  product,
  productId,
  categories,
  brands,
}: ProductFormProps) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const initialValues =
    product && type === "Update"
      ? { ...product, subCategory: product.subCategory || [] }
      : {
          title: "",
          description: "",
          images: [],
          price: "",
          oldPrice: "",
          buyingPrice: "",
          stock: "",
          category: "",
          subCategory: [],
          brand: "",
          features: [],
          sku: "",
          variations: [],
          link: "",
        };

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    try {
      const payload = { ...values };

      if (type === "Create") {
        const newProduct = await createProduct(payload);
        if (newProduct) {
          form.reset();
          toast.success("Product created successfully!");
          router.push("/dashboard/products");
        }
      } else if (type === "Update" && productId) {
        const updatedProduct = await updateProduct(productId, payload);
        if (updatedProduct) {
          form.reset();
          toast.success("Product updated successfully!");
          router.push("/dashboard/products");
        }
      }
    } catch (error) {
      console.error("Product submission failed", error);
      toast.error("Something went wrong.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-6 rounded-lg border bg-white p-6 shadow-sm"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter product title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <RichTextEditor value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Product Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {form.watch("images")?.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 border rounded-lg p-3 bg-muted/40 shadow-sm"
              >
                <FormField
                  control={form.control}
                  name={`images.${index}.imageUrl`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Image</FormLabel>
                      <FormControl>
                        <FileUploader
                          onFieldChange={async (_blobUrl, files) => {
                            if (files && files.length > 0) {
                              const uploaded = await startUpload(files);
                              if (uploaded && uploaded[0]) {
                                const newImages = form
                                  .getValues("images")
                                  .map((img, idx) =>
                                    idx === index
                                      ? { ...img, imageUrl: uploaded[0].url }
                                      : img
                                  );
                                form.setValue("images", newImages);
                              }
                            }
                          }}
                          imageUrl={field.value || ""}
                          setFiles={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    const current = form.getValues("images") || [];
                    const updated = [
                      ...current.slice(0, index),
                      ...current.slice(index + 1),
                    ];
                    form.setValue("images", updated);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const current = form.getValues("images") || [];
                form.setValue("images", [...current, { imageUrl: "" }]);
              }}
            >
              + Add Image
            </Button>
          </div>
        </div>

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="Enter price" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Old Price */}
        <FormField
          control={form.control}
          name="oldPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old Price</FormLabel>
              <FormControl>
                <Input placeholder="Enter old price (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buying Price */}
        <FormField
          control={form.control}
          name="buyingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Buying Price</FormLabel>
              <FormControl>
                <Input placeholder="Enter buying price (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stock */}
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input placeholder="Enter stock quantity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => {
                const options = Array.isArray(categories)
                  ? categories.map((a) => ({
                      label: a.title,
                      value: a.title,
                    }))
                  : [];

                return (
                  <Select
                    options={options}
                    isSearchable
                    value={
                      options.find((opt) => opt.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    placeholder="Search and select category"
                    classNamePrefix="react-select"
                  />
                );
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* SubCategory */}
        <FormItem>
          <FormLabel>Subcategory</FormLabel>
          <FormControl>
            <Controller
              control={form.control}
              name="subCategory"
              render={({ field }) => {
                const options = [
                  { label: "New Arrival", value: "New Arrival" },
                  { label: "Featured", value: "Featured" },
                  { label: "Best Seller", value: "Best Seller" },
                  { label: "Trending", value: "Trending" },
                  { label: "Limited Edition", value: "Limited Edition" },
                  { label: "Exclusive", value: "Exclusive" },
                  { label: "Top Rated", value: "Top Rated" },
                  { label: "On Sale", value: "On Sale" },
                  { label: "Flash Deal", value: "Flash Deal" },
                  { label: "Clearance", value: "Clearance" },
                  { label: "Back in Stock", value: "Back in Stock" },
                  { label: "Hot Deal", value: "Hot Deal" },
                  { label: "Editor's Pick", value: "Editor's Pick" },
                  { label: "Weekly Highlight", value: "Weekly Highlight" },
                  { label: "Seasonal Offer", value: "Seasonal Offer" },
                  { label: "Recommended", value: "Recommended" },
                  { label: "Gift Idea", value: "Gift Idea" },
                  { label: "Customer Favorite", value: "Customer Favorite" },
                ];

                return (
                  <Select
                    options={options}
                    isSearchable
                    isMulti
                    value={options.filter((opt) =>
                      field.value?.includes(opt.value)
                    )}
                    onChange={(selected) =>
                      field.onChange(selected.map((s) => s.value))
                    }
                    placeholder="Select one or more subcategories"
                    classNamePrefix="react-select"
                  />
                );
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Brand */}
        <FormItem>
          <FormLabel>Brand</FormLabel>
          <FormControl>
            <Controller
              control={form.control}
              name="brand"
              render={({ field }) => {
                const options = Array.isArray(brands)
                  ? brands.map((a) => ({
                      label: a.title,
                      value: a.title,
                    }))
                  : [];

                return (
                  <Select
                    options={options}
                    isSearchable
                    value={
                      options.find((opt) => opt.value === field.value) || null
                    }
                    onChange={(selected) =>
                      field.onChange(selected?.value || "")
                    }
                    placeholder="Search and select brand"
                    classNamePrefix="react-select"
                  />
                );
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Features */}
        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <FormControl>
                <FeatureEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SKU */}
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="Enter SKU" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variations */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Variations</h3>
          {form.watch("variations")?.map((variation, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border p-4 rounded-md bg-muted/40"
            >
              <FormField
                control={form.control}
                name={`variations.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Color or Size" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`variations.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Red or XL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`variations.${index}.additionalPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Price</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  const current = form.getValues("variations") || [];
                  form.setValue("variations", [
                    ...current.slice(0, index),
                    ...current.slice(index + 1),
                  ]);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const current = form.getValues("variations") || [];
              form.setValue("variations", [
                ...current,
                { name: "", value: "", additionalPrice: "" },
              ]);
            }}
          >
            Add Variation
          </Button>
        </div>

        {/* Link */}
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Link</FormLabel>
              <FormControl>
                <Input placeholder="Enter product link (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="mt-6">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Submitting..." : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
