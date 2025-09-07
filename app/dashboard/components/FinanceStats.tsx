"use client";

import { Card } from "@/components/ui/card";
import { IOrder } from "@/lib/database/models/order.model";
import { IProduct } from "@/lib/database/models/product.model";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

interface FinanceStatsProps {
  products: IProduct[];
  orders: IOrder[];
}

// Assuming order.products has items like this:
// { productId: string, quantity: number, sellingPrice: number, ... }
interface IOrderProduct {
  productId: string;
  quantity: number;
  sellingPrice: number;
  title: string;
  images?: string;
  sku?: string;
}

const FinanceStats = ({ products, orders }: FinanceStatsProps) => {
  // ---- Revenue ----
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.paymentStatus === "Partial" && order.advancePaid) {
      return sum + Number(order.advancePaid || 0);
    }
    return sum + Number(order.totalAmount || 0);
  }, 0);

  // ---- Cost ----
  let totalCost = 0;
  orders.forEach((order) => {
    (order.products as IOrderProduct[]).forEach((op) => {
      const product = products.find((p) => p._id === op.productId);
      const qty = op.quantity || 1;
      if (product) {
        // wholesalePrice is only on product itself
        const wholesale = product.wholesalePrice || 0;
        totalCost += Number(wholesale) * qty;
      }
    });
  });

  // ---- Profit ----
  const profit = totalRevenue - totalCost;

  // ---- Sales Count (total units sold) ----
  const totalSales = orders.reduce(
    (sum, order) =>
      sum +
      (order.products as IOrderProduct[]).reduce(
        (inner, op) => inner + (op.quantity || 1),
        0
      ),
    0
  );

  // ---- Stats Config ----
  const stats = [
    {
      title: "Total Revenue",
      value: `৳${totalRevenue.toFixed(2)}`,
      percent: 100,
    },
    {
      title: "Total Cost",
      value: `৳${totalCost.toFixed(2)}`,
      percent: totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0,
    },
    {
      title: "Profit",
      value: `৳${profit.toFixed(2)}`,
      percent: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
    },
    {
      title: "Sales Count",
      value: totalSales,
      percent: 100,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className="rounded-2xl shadow-md bg-white px-5 py-6 flex flex-col justify-between transition hover:shadow-xl"
        >
          <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="w-16 h-16">
              <CircularProgressbar
                value={stat.percent}
                text={stat.value.toString()}
                styles={buildStyles({
                  textColor: "#6C63FF",
                  pathColor: "#6C63FF",
                  trailColor: "#eee",
                  textSize: "14px",
                })}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FinanceStats;
