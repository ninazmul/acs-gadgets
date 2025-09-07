"use client";

import * as z from "zod";
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
import { useRouter } from "next/navigation";
import { createPayment, updatePayment } from "@/lib/actions/payment.actions";
import { IPayment } from "@/lib/database/models/payment.model";

const PaymentFormSchema = z.object({
  seller: z.string().email("Invalid seller email."),
  amount: z.string().min(1, "Amount is required."),
  paymentMethod: z.string().min(1, "Payment Method is required."),
  accountDetails: z.string().optional(),
  progress: z.enum(["Pending", "In Progress", "Paid"]).default("Pending"),
  author: z.string().optional(),
});

type PaymentFormProps = {
  type: "Create" | "Update";
  Payment?: IPayment;
  PaymentId?: string;
  email?: string; // seller email
};

const PaymentForm = ({ type, Payment, PaymentId, email }: PaymentFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof PaymentFormSchema>>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      seller: email || Payment?.seller || "",
      amount: Payment?.amount || "",
      paymentMethod: Payment?.paymentMethod || "",
      accountDetails: Payment?.accountDetails || "",
      progress:
        (Payment?.progress as "Pending" | "In Progress" | "Paid") || "Pending",
    },
  });

  const onSubmit = async (values: z.infer<typeof PaymentFormSchema>) => {
    try {
      const paymentData = {
        ...values,
        accountDetails: values.accountDetails ?? "",
        progress: type === "Create" ? "Pending" : Payment?.progress || "Pending",
        createdAt: new Date(),
      };

      if (type === "Create") {
        const created = await createPayment(paymentData);
        if (created) {
          form.reset();
          router.push("/dashboard/payment");
        }
      } else if (type === "Update" && PaymentId) {
        const updated = await updatePayment(PaymentId, paymentData);
        if (updated) {
          router.push("/dashboard/payment");
        }
      }
    } catch (error) {
      console.error("Payment form submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 rounded-lg border bg-white p-6 shadow-sm"
      >
        {/* Hidden Seller Field */}
        <FormField
          control={form.control}
          name="seller"
          render={() => (
            <FormItem>
              <FormLabel>Seller</FormLabel>
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

        {/* Amount Field */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter amount" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method Field */}
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select Method</option>
                  <option value="Bank">Bank</option>
                  <option value="bKash">bKash</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Details Field */}
        <FormField
          control={form.control}
          name="accountDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Details</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. IBAN, Email, etc." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : type === "Create"
            ? "Create Payment"
            : "Update Payment"}
        </Button>
      </form>
    </Form>
  );
};

export default PaymentForm;
