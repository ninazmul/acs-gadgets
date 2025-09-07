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
import { createCustomer, updateCustomer } from "@/lib/actions/customer.actions";
import { ICustomer } from "@/lib/database/models/customer.model";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Select from "react-select";

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

// Validation schema (addedBy is injected, not included here)
const rootCustomerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  number: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  areaOfDelivery: z.string().min(1, "Area of delivery is required"),
});

type RootCustomerFormProps = {
  type: "Create" | "Update";
  customer?: ICustomer;
  customerId?: string;
  email: string; // this is addedBy
};

const RootCustomerForm = ({
  type,
  customer,
  customerId,
  email,
}: RootCustomerFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof rootCustomerFormSchema>>({
    resolver: zodResolver(rootCustomerFormSchema),
    defaultValues:
      type === "Update" && customer
        ? {
            name: customer.name || "",
            email: customer.email || "",
            number: customer.number || "",
            address: customer.address || "",
            district: customer.district || "",
            areaOfDelivery: customer.areaOfDelivery || "",
          }
        : {
            name: "",
            email: "",
            number: "",
            address: "",
            district: "",
            areaOfDelivery: "",
          },
  });

  async function onSubmit(values: z.infer<typeof rootCustomerFormSchema>) {
    try {
      const payload = {
        ...values,
        addedBy: email,
      };

      if (type === "Create") {
        const newCustomer = await createCustomer(payload);
        if (newCustomer) {
          form.reset(); 
          toast.success("Customer created successfully!");
          router.refresh();
        }
      } else if (type === "Update" && customerId) {
        const updated = await updateCustomer(customerId, payload);
        if (updated) {
          toast.success("Customer updated successfully!");
          router.push("/dashboard/customers");
        }
      }
    } catch (error) {
      console.error("Customer submission failed", error);
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. john@example.com"
                  type="email"
                  {...field}
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

        {/* Area of Delivery */}
        <FormField
          control={form.control}
          name="areaOfDelivery"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area of Delivery</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Dhanmondi, Mirpur" {...field} />
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
          {form.formState.isSubmitting ? "Submitting..." : `${type} Customer`}
        </Button>
      </form>
    </Form>
  );
};

export default RootCustomerForm;
