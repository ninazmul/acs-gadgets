"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getCartsByEmail } from "@/lib/actions/cart.actions";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCustomersByEmail } from "@/lib/actions/customer.actions";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId, getUserEmailById } from "@/lib/actions/user.actions";
import RootCustomerForm from "@/components/shared/RootCustomerForm";
import axios from "axios";
import Loader from "@/components/shared/Loader";

type CartItem = {
  _id: string;
  productId: string;
  title: string;
  images: string;
  price: number;
  sellingPrice: number;
  quantity: number;
  category: string;
  brand: string;
  sku: string;
  variations?: {
    name: string;
    value: string;
  }[];
};

type Customer = {
  _id: string;
  name: string;
  email: string;
  number: string;
  address: string;
  areaOfDelivery: string;
  district: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const [userEmail, setUserEmail] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState<number>(110);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "cod">("cod");

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.sellingPrice || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const ADVANCE_AMOUNT = useMemo(() => {
    return paymentMethod === "bkash" ? subtotal + shipping : 200;
  }, [paymentMethod, subtotal, shipping]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.id) return;
      try {
        const userID = await getUserByClerkId(user.id);
        const email = await getUserEmailById(userID);
        const result = await getCustomersByEmail(email);
        setCustomers(result || []);
      } catch {
        toast.error("Failed to load customers.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
    const intervalId = setInterval(fetchCustomers, 3000);
    return () => clearInterval(intervalId);
  }, [user?.id]);

  const fetchCartData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsCartLoading(true);
      const userID = await getUserByClerkId(user.id);
      const email = await getUserEmailById(userID);
      const items = await getCartsByEmail(email);

      setUserEmail(email);
      setCartItems(items || []);
    } catch {
      toast.error("Failed to load cart items.");
    } finally {
      setIsCartLoading(false);
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCartData();
    const interval = setInterval(fetchCartData, 3000);
    return () => clearInterval(interval);
  }, [fetchCartData]);

  if (!isLoading && !isCartLoading && cartItems.length === 0) {
    router.push("/products");
  }

  if (isLoading) {
    return <Loader />;
  }

  const initiateBkashPayment = async () => {
    if (!selectedCustomer) {
      toast.error("Select a customer first.");
      return;
    }

    try {
      setIsPlacingOrder(true);

      const reference = "user_" + Date.now();

      const paymentPayload = {
        customer: selectedCustomer,
        cartItems,
        note,
        shipping,
        subtotal,
        total,
        paymentMethod,
        userEmail,
        reference,
      };

      const response = await axios.post("/api/make-payment", paymentPayload);

      if (response.data?.url) {
        // redirect to bKash gateway
        router.push(response.data.url);
      } else {
        console.error("bKash Payment initiation error:", response.data);
        toast.error("Failed to initiate bKash payment.");
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error("Payment failed.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Shipping and Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Customer Section */}
        <div className="space-y-4">
          <label className="block font-semibold">Select Customer:</label>
          <select
            className="w-full border p-2 rounded"
            onChange={(e) => {
              const customer = customers.find(
                (c) => c.email === e.target.value
              );
              if (customer) {
                setSelectedCustomer(customer);
                setShipping(
                  customer.district.toLowerCase() === "dhaka" ? 60 : 120
                );
              } else {
                setSelectedCustomer(null);
                setShipping(110);
              }
            }}
            value={selectedCustomer?.email || ""}
          >
            <option value="">-- Select --</option>
            {customers.map((c) => (
              <option key={c._id} value={c.email}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>

          {isLoading ? (
            <Loader />
          ) : selectedCustomer ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={selectedCustomer.name}
                  readOnly
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  value={selectedCustomer.number}
                  readOnly
                  className="border p-2 rounded"
                />
              </div>
              <input
                type="text"
                value={selectedCustomer.address}
                readOnly
                className="w-full border p-2 rounded"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={selectedCustomer.district}
                  readOnly
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  value={selectedCustomer.areaOfDelivery}
                  readOnly
                  className="border p-2 rounded"
                />
              </div>
              <input
                type="email"
                value={selectedCustomer.email}
                readOnly
                className="w-full border p-2 rounded"
              />
            </>
          ) : (
            <>
              <label className="block font-semibold">Create Customer:</label>
              <RootCustomerForm type="Create" email={userEmail} />
            </>
          )}

          <textarea
            placeholder="Order Notes (optional)"
            className="w-full border p-2 rounded"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Order Summary Section */}
        <div className="space-y-4 border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Your Order</h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-start justify-between">
                <div className="flex gap-2">
                  <Image
                    src={item.images}
                    alt={item.title}
                    width={50}
                    height={50}
                    className="rounded border h-20 w-14 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      x {item.quantity}
                    </p>
                    {Array.isArray(item.variations) &&
                      item.variations.length > 0 && (
                        <div className="text-xs text-gray-500 space-y-1 mt-1">
                          {item.variations.map((variation, index) => (
                            <p key={index}>
                              {variation.name}:{" "}
                              <strong>{variation.value}</strong>
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
                <p className="text-sm font-semibold">
                  ৳{item.sellingPrice.toFixed(2)} * {item.quantity} = ৳
                  {(item.sellingPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>৳{shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total:</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-semibold mb-2">Select Payment Method:</p>
            <label className="inline-flex items-center mr-6 cursor-pointer">
              <input
                type="radio"
                className="mr-2"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery (৳200 advance)
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                className="mr-2"
                checked={paymentMethod === "bkash"}
                onChange={() => setPaymentMethod("bkash")}
              />
              bKash (Full payment)
            </label>
          </div>

          <Button
            onClick={initiateBkashPayment}
            disabled={
              isPlacingOrder || !selectedCustomer || cartItems.length === 0
            }
            className="mb-4 w-full"
          >
            {isPlacingOrder
              ? "Processing..."
              : paymentMethod === "bkash"
              ? `Pay ৳${ADVANCE_AMOUNT.toFixed(2)} via bKash`
              : `Pay ৳${ADVANCE_AMOUNT.toFixed(2)} advance via bKash`}
          </Button>
        </div>
      </div>
    </section>
  );
}
