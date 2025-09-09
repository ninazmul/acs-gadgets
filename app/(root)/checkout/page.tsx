"use client";

import { useEffect, useState, useMemo } from "react";
import { getCartsByEmail } from "@/lib/actions/cart.actions";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Loader from "@/components/shared/Loader";

type CartItem = {
  _id: string;
  productId: string;
  title: string;
  images: string;
  price: number;
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

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState<number>(110);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "cod">("cod");

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    number: "",
    address: "",
    areaOfDelivery: "",
    district: "",
  });

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price ?? 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const total = useMemo(
    () => (subtotal ?? 0) + (shipping ?? 0),
    [subtotal, shipping]
  );

  const ADVANCE_AMOUNT = useMemo(
    () => (paymentMethod === "bkash" ? (subtotal ?? 0) + (shipping ?? 0) : 200),
    [paymentMethod, subtotal, shipping]
  );

  // Fetch cart data
  useEffect(() => {
    const fetchCartData = async () => {
      if (!user?.id) return;
      try {
        setIsCartLoading(true);
        const items = await getCartsByEmail(
          user.emailAddresses?.[0]?.emailAddress || ""
        );
        setCartItems(items || []);
      } catch {
        toast.error("Failed to load cart items.");
      } finally {
        setIsCartLoading(false);
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [user?.id, user?.emailAddresses]);

  if (!isLoading && !isCartLoading && cartItems.length === 0) {
    router.push("/products");
  }

  if (isLoading) {
    return <Loader />;
  }

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));

    if (name === "district") {
      setShipping(value.toLowerCase() === "dhaka" ? 60 : 120);
    }
  };

  const initiateBkashPayment = async () => {
    // validate customer
    if (
      !customer.name ||
      !customer.email ||
      !customer.number ||
      !customer.address
    ) {
      toast.error("Please fill in all customer details.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const reference = "user_" + Date.now();

      const paymentPayload = {
        customer,
        cartItems,
        note,
        shipping,
        subtotal,
        total,
        paymentMethod,
        userEmail: user?.emailAddresses?.[0]?.emailAddress || "",
        reference,
      };

      const response = await axios.post("/api/make-payment", paymentPayload);

      if (response.data?.url) {
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
        {/* Customer Form */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={customer.name}
            onChange={handleCustomerChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={customer.email}
            onChange={handleCustomerChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="number"
            placeholder="Phone Number"
            value={customer.number}
            onChange={handleCustomerChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={customer.address}
            onChange={handleCustomerChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="areaOfDelivery"
            placeholder="Area of Delivery"
            value={customer.areaOfDelivery}
            onChange={handleCustomerChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="district"
            placeholder="District"
            value={customer.district}
            onChange={handleCustomerChange}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Order Notes (optional)"
            className="w-full border p-2 rounded"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Order Summary */}
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
                          {item.variations.map((v, i) => (
                            <p key={i}>
                              {v.name}: <strong>{v.value}</strong>
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
                <p className="text-sm font-semibold">
                  ৳{item.price.toFixed(2)} * {item.quantity} = ৳
                  {(item.price * item.quantity).toFixed(2)}
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
            disabled={isPlacingOrder || cartItems.length === 0}
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
