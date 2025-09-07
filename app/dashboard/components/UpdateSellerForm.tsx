"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { updateSeller } from "@/lib/actions/seller.actions";
import { ISeller } from "@/lib/database/models/seller.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Select from "react-select";
import { FileUploader } from "@/components/shared/FileUploader";
import { useUploadThing } from "@/lib/uploadthing";

const districts = [
  "Bagerhat",
  "Bandarban",
  "Barguna",
  "Barisal",
  "Bhola",
  "Bogra",
  "Brahmanbaria",
  "Chandpur",
  "Chapai Nawabganj",
  "Chattogram",
  "Chuadanga",
  "Comilla",
  "Cox's Bazar",
  "Dhaka",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gaibandha",
  "Gazipur",
  "Gopalganj",
  "Habiganj",
  "Jamalpur",
  "Jashore",
  "Jhalokathi",
  "Jhenaidah",
  "Joypurhat",
  "Khagrachari",
  "Khulna",
  "Kishoreganj",
  "Kurigram",
  "Kushtia",
  "Lakshmipur",
  "Lalmonirhat",
  "Madaripur",
  "Magura",
  "Manikganj",
  "Meherpur",
  "Moulvibazar",
  "Munshiganj",
  "Mymensingh",
  "Naogaon",
  "Narail",
  "Narayanganj",
  "Narsingdi",
  "Natore",
  "Netrokona",
  "Nilphamari",
  "Noakhali",
  "Pabna",
  "Panchagarh",
  "Patuakhali",
  "Pirojpur",
  "Rajbari",
  "Rajshahi",
  "Rangamati",
  "Rangpur",
  "Satkhira",
  "Shariatpur",
  "Sherpur",
  "Sirajganj",
  "Sunamganj",
  "Sylhet",
  "Tangail",
  "Thakurgaon",
];

const districtOptions = districts.map((district) => ({
  label: district,
  value: district,
}));

const updateSellerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  number: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  shopName: z.string().min(1, "Shop name is required"),
  shopLogo: z.string().url("Valid logo URL is required"),
});

type UpdateSellerFormProps = {
  type: "Create" | "Update";
  seller?: ISeller;
  sellerId?: string;
  email: string;
};

const UpdateSellerForm = ({ type, seller, sellerId, email }: UpdateSellerFormProps) => {
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const form = useForm<z.infer<typeof updateSellerFormSchema>>({
    resolver: zodResolver(updateSellerFormSchema),
    defaultValues:
      type === "Update" && seller
        ? {
            name: seller.name || "",
            email: email,
            number: seller.number || "",
            address: seller.address || "",
            district: seller.district || "",
            shopName: seller.shopName || "",
            shopLogo: seller.shopLogo || "",
          }
        : {
            name: "",
            email: email,
            number: "",
            address: "",
            district: "",
            shopName: "",
            shopLogo: "",
          },
  });

  async function onSubmit(values: z.infer<typeof updateSellerFormSchema>) {
    try {
      const payload = {
        ...values,
        email: email,
      };

       if (type === "Update" && sellerId) {
        const updated = await updateSeller(sellerId, payload);
        if (updated) {
          toast.success("Seller updated successfully!");
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Seller submission failed", error);
      toast.error("Something went wrong.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-lg border bg-white p-6 shadow-sm"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={() => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. john@example.com"
                  type="email"
                  value={email}
                  disabled
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. +880123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g. House 123, Road 4" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* District */}
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <FormControl>
                <Select
                  options={districtOptions}
                  placeholder="Select district"
                  isSearchable
                  value={
                    districtOptions.find(
                      (option) => option.value === field.value
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    field.onChange(selectedOption?.value || "");
                  }}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Shop Name */}
        <FormField
          control={form.control}
          name="shopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Urban Mart" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Shop Logo */}
        <FormField
          control={form.control}
          name="shopLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Logo</FormLabel>
              <FormControl>
                <FileUploader
                  imageUrl={field.value}
                  onFieldChange={async (_blobUrl, files) => {
                    if (files && files.length > 0) {
                      const uploaded = await startUpload(files);
                      if (uploaded && uploaded[0]) {
                        form.setValue("shopLogo", uploaded[0].url);
                      }
                    }
                  }}
                  setFiles={() => {}}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : `${type} Seller Account`}
        </Button>
      </form>
    </Form>
  );
};

export default UpdateSellerForm;
