"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { addToCart, getCartsByEmail } from "@/lib/actions/cart.actions";
import toast from "react-hot-toast";

type Variation = {
  name: string;
  value: string;
  additionalPrice?: number | string;
};

type Product = {
  _id: string;
  title: string;
  images: { imageUrl: string; _id: string }[];
  price: string | number;
  suggestedPrice?: string | number;
  sellingPrice?: string | number;
  category: string;
  brand?: string;
  sku: string;
  variations?: Variation[];
};

type CartItem = {
  productId: string;
  quantity: number;
  variations?: Variation[];
  sellingPrice: number;
};

type AddToCartProps = {
  product: Product;
  email: string;
  isSeller?: boolean;
  isAdmin?: boolean;
};

const AddToCart = ({ product, email, isSeller, isAdmin }: AddToCartProps) => {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    null
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [priceType, setPriceType] = useState<"suggested" | "custom">(
    "suggested"
  );
  const [customPrice, setCustomPrice] = useState("");

  // Original base price (does not change)
  const originalPrice = parseFloat(product.price.toString());

  // Selected base price (either suggested or custom)
  const selectedBasePrice =
    priceType === "custom"
      ? parseFloat(customPrice || "0")
      : parseFloat(
          product.sellingPrice?.toString() ||
            product.suggestedPrice?.toString() ||
            product.price.toString()
        );

  // Additional price from variation
  const additionalPrice = selectedVariation?.additionalPrice
    ? parseFloat(selectedVariation.additionalPrice.toString())
    : 0;

  // Final selling price per unit
  const finalPrice = selectedBasePrice + additionalPrice;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const items = await getCartsByEmail(email);
        setCartItems(
          (items || []).map((item: CartItem) => ({
            ...item,
            sellingPrice: parseFloat(item.sellingPrice?.toString() || "0"),
          }))
        );
      } catch (err) {
        console.error("Failed to load cart", err);
      }
    };
    fetchCart();
  }, [email]);

  const isAlreadyInCart = () => {
    return cartItems.some((item) => {
      if (item.productId !== product._id) return false;
      if (item.quantity !== quantity) return false;

      // Compare variations
      if (item.variations?.length !== (selectedVariation ? 1 : 0)) return false;

      if (selectedVariation && item.variations) {
        const match = item.variations.some(
          (v) =>
            v.name === selectedVariation.name &&
            v.value === selectedVariation.value &&
            parseFloat(v.additionalPrice?.toString() || "0") ===
              parseFloat(selectedVariation.additionalPrice?.toString() || "0")
        );
        if (!match) return false;
      }

      // Compare price — if different, allow adding again
      if (item.sellingPrice !== finalPrice) {
        return false;
      }

      return true;
    });
  };

  const handleAddToCart = async () => {
    if (
      product.variations &&
      product.variations.length > 0 &&
      !selectedVariation
    ) {
      toast.error("Please select a variation before adding to cart.");
      return;
    }

    if (
      priceType === "custom" &&
      (!customPrice || isNaN(Number(customPrice)))
    ) {
      toast.error("Please enter a valid custom price.");
      return;
    }

    if (priceType === "custom") {
      const suggested = parseFloat(
        product.sellingPrice?.toString() ||
          product.suggestedPrice?.toString() ||
          product.price.toString()
      );
      const entered = parseFloat(customPrice || "0");

      if (entered < suggested) {
        toast.error(`Custom price cannot be lower than ৳${suggested}.`);
        return;
      }
    }

    if (isAlreadyInCart()) {
      toast.error(
        "This exact product with selected variation, quantity, and price is already in your cart."
      );
      return;
    }

    setLoading(true);

    try {
      await addToCart({
        productId: product._id,
        title: product.title,
        images: product.images?.[0]?.imageUrl || "",
        price: originalPrice,
        sellingPrice: finalPrice,
        quantity,
        category: product.category,
        brand: product.brand,
        sku: product.sku,
        variations: selectedVariation
          ? [
              {
                name: selectedVariation.name,
                value: selectedVariation.value,
              },
            ]
          : [],
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success("Added to cart successfully!");
      setCartItems((prev) => [
        ...prev,
        {
          productId: product._id,
          quantity,
          variations: selectedVariation ? [selectedVariation] : [],
          sellingPrice: finalPrice,
        },
      ]);
      setQuantity(1);
      setSelectedVariation(null);
      setPriceType("suggested");
      setCustomPrice("");
    } catch (err) {
      toast.error("Something went wrong while adding to cart.");
      console.error("Add to cart failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Variation Selector */}
      {product.variations && product.variations.length > 0 && (
        <div className="space-y-1">
          <Label>Select Variant</Label>
          <Select
            onValueChange={(val) => {
              const variant = product.variations?.find((v) => v.value === val);
              setSelectedVariation(variant || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Variation" />
            </SelectTrigger>
            <SelectContent>
              {product.variations.map((variation) => (
                <SelectItem key={variation.value} value={variation.value}>
                  {variation.value}
                  {variation.additionalPrice &&
                  parseFloat(variation.additionalPrice.toString()) > 0
                    ? ` (+৳${variation.additionalPrice})`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Type Selector */}
      <div className="space-y-1">
        <Label>Selling Price</Label>
        <Select
          onValueChange={(val) => setPriceType(val as "suggested" | "custom")}
          defaultValue="suggested"
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose price type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="suggested">Suggested Price</SelectItem>
            <SelectItem value="custom">Custom Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Price Input */}
      {priceType === "custom" && (
        <div className="space-y-1">
          <Label>Enter Custom Price</Label>
          <Input
            type="number"
            min={1}
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
          />
        </div>
      )}

      {/* Quantity Input */}
      <div className="space-y-1">
        <Label>Quantity</Label>
        <Input
          type="number"
          value={quantity}
          min={1}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
        />
      </div>

      {/* Price Display */}
      {(isAdmin || isSeller) && (
        <div className="font-semibold text-lg">
          Total: ৳{(finalPrice * quantity).toFixed(2)}
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={
          loading ||
          (!isAdmin && !isSeller) ||
          (!!product.variations &&
            product.variations.length > 0 &&
            !selectedVariation)
        }
        className="w-full"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  );
};

export default AddToCart;
