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
import toast from "react-hot-toast";
import Select from "react-select";
import { FileUploader } from "@/components/shared/FileUploader";
import { useUploadThing } from "@/lib/uploadthing";
import { ISetting } from "@/lib/database/models/setting.model";

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

const sellerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  number: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  shopName: z.string().min(1, "Shop name is required"),
  shopLogo: z.string().url("Valid logo URL is required"),
  website: z
    .string()
    .min(1, "Website or Facebook page is required")
    .url("Invalid URL"),
});

type SellerFormProps = {
  type: "Create" | "Update";
  email: string;
  setting: ISetting;
};

const SellerForm = ({ type, email, setting }: SellerFormProps) => {
  const { startUpload } = useUploadThing("imageUploader");

  const form = useForm<z.infer<typeof sellerFormSchema>>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      name: "",
      email,
      number: "",
      address: "",
      district: "",
      shopName: "",
      shopLogo: "",
      website: "",
    },
  });

  // Function to initiate bKash payment
  const handlePayment = async (values: z.infer<typeof sellerFormSchema>) => {
    try {
      const payload = { ...values, email, amount: setting.registrationAmount };
      // Generate a unique reference for the transaction
      const reference = "user_" + Date.now();
      const paymentPayload = { ...payload, reference };

      const res = await fetch("/api/register/make-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const data = await res.json();

      if (data?.url) {
        toast.success("Redirecting to bKash payment gateway...");
        window.location.href = data.url;
      } else {
        toast.error(data?.message || "Failed to initiate payment.");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error("Payment failed.");
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6 rounded-lg border bg-white p-8 shadow-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4">
          Seller Registration
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Complete the form below and pay the registration fee via bKash to
          create your seller account.
        </p>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <Input type="email" value={email} disabled readOnly />
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
              <FormLabel>Phone Number (bKash)</FormLabel>
              <FormControl>
                <Input placeholder="+880123456789" {...field} />
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="House 123, Road 4" {...field} />
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
                  onChange={(option) => field.onChange(option?.value || "")}
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
                <Input placeholder="Urban Mart" {...field} />
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
                    if (files?.length) {
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

        {/* Website (optional) */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website or Facebook Page (required)</FormLabel>
              <FormControl>
                <Input placeholder="https://yourshop.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* bKash Payment Info */}
        <p className="text-sm text-gray-500 text-center mt-2">
          After submitting, you will be redirected to the bKash gateway to pay a
          registration fee of <strong>৳{setting.registrationAmount}</strong>.
          Your account will be created once the payment is successful.
        </p>

        {/* Submit */}
        <Button
          type="button"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full mt-4"
          onClick={form.handleSubmit(handlePayment)}
        >
          {form.formState.isSubmitting
            ? "Processing..."
            : `${type} Seller Account`}
        </Button>
      </form>
    </Form>
  );
};

export default SellerForm;
