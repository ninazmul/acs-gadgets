"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type Customer = {
  totalOrders: string;
  totalSpend: string;
  successfulOrder: string;
  canceledOrder: string;
  createdAt: string;
  updatedAt: string;
};

function calculateCustomerStats(customers: Customer[]) {
  const totalCustomers = customers.length;
  let totalOrders = 0;
  let totalSpend = 0;
  let successfulOrder = 0;
  let canceledOrder = 0;

  customers.forEach((customer) => {
    totalOrders += parseInt(customer.totalOrders || "0");
    totalSpend += parseFloat(customer.totalSpend || "0");
    successfulOrder += parseInt(customer.successfulOrder || "0");
    canceledOrder += parseInt(customer.canceledOrder || "0");
  });

  const averageOrderValue =
    totalOrders > 0 ? parseFloat((totalSpend / totalOrders).toFixed(2)) : 0;

  const successRate =
    totalOrders > 0
      ? parseFloat(((successfulOrder / totalOrders) * 100).toFixed(2))
      : 0;

  return {
    totalCustomers,
    totalOrders,
    totalSpend,
    successfulOrder,
    canceledOrder,
    averageOrderValue,
    successRate,
  };
}

const CustomerStats = ({ customers }: { customers: Customer[] }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [range, setRange] = useState<"7d" | "1m" | "1y" | "custom">("7d");

  useEffect(() => {
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");

    if (startParam && endParam) {
      setStartDate(new Date(startParam));
      setEndDate(new Date(endParam));
      setRange("custom");
    } else {
      const today = new Date();
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 6);
      setStartDate(last7Days);
      setEndDate(today);
      setRange("7d");
    }
  }, [searchParams]);

  const filteredCustomers = useMemo(() => {
    if (!startDate || !endDate) return [];
    return customers.filter((cust) => {
      const created = new Date(cust.createdAt);
      const updated = new Date(cust.updatedAt);
      return (
        (created >= startDate && created <= endDate) ||
        (updated >= startDate && updated <= endDate)
      );
    });
  }, [customers, startDate, endDate]);

  const {
    totalCustomers,
    totalOrders,
    totalSpend,
    successfulOrder,
    canceledOrder,
    averageOrderValue,
    successRate,
  } = calculateCustomerStats(filteredCustomers);

  const updateDateRange = (
    newRange: "7d" | "1m" | "1y" | "custom",
    customStart?: string,
    customEnd?: string
  ) => {
    let start: Date, end: Date;
    const today = new Date();

    if (newRange === "7d") {
      end = today;
      start = new Date();
      start.setDate(end.getDate() - 6);
    } else if (newRange === "1m") {
      end = today;
      start = new Date();
      start.setMonth(end.getMonth() - 1);
    } else if (newRange === "1y") {
      end = today;
      start = new Date();
      start.setFullYear(end.getFullYear() - 1);
    } else if (newRange === "custom" && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
    } else {
      return;
    }

    setStartDate(start);
    setEndDate(end);
    setRange(newRange);

    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", start.toISOString().split("T")[0]);
    params.set("endDate", end.toISOString().split("T")[0]);
    router.push(`?${params.toString()}`);
  };

  const statsData = [
    { title: "Total Customers", value: totalCustomers, color: "text-gray-800" },
    { title: "Total Orders", value: totalOrders, color: "text-blue-600" },
    {
      title: "Total Spend",
      value: `৳ ${totalSpend.toFixed(2)}`,
      color: "text-green-600",
    },
    {
      title: "Avg Order Value",
      value: `৳ ${averageOrderValue.toFixed(2)}`,
      color: "text-yellow-600",
    },
    {
      title: "Successful Orders",
      value: successfulOrder,
      color: "text-green-600",
    },
    { title: "Canceled Orders", value: canceledOrder, color: "text-red-500" },
    {
      title: "Success Rate",
      value: successRate,
      isProgress: true,
      color: "text-green-600",
    },
  ];

  return (
    <section>
      {/* Date Range Selector */}
      <div className="flex gap-4 mb-6 items-center flex-wrap">
        <select
          value={range}
          onChange={(e) =>
            updateDateRange(e.target.value as "7d" | "1m" | "1y" | "custom")
          }
          className="border rounded px-3 py-2"
        >
          <option value="7d">Last 7 Days</option>
          <option value="1m">Last 1 Month</option>
          <option value="1y">Last 1 Year</option>
          <option value="custom">Custom</option>
        </select>

        <input
          type="date"
          value={startDate ? startDate.toISOString().split("T")[0] : ""}
          disabled={range !== "custom"}
          onChange={(e) =>
            updateDateRange(
              "custom",
              e.target.value,
              endDate?.toISOString().split("T")[0]
            )
          }
          className="border rounded px-3 py-2 disabled:opacity-50"
        />
        <input
          type="date"
          value={endDate ? endDate.toISOString().split("T")[0] : ""}
          disabled={range !== "custom"}
          onChange={(e) =>
            updateDateRange(
              "custom",
              startDate?.toISOString().split("T")[0],
              e.target.value
            )
          }
          className="border rounded px-3 py-2 disabled:opacity-50"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl shadow-md bg-white px-5 py-6 flex flex-col justify-between transition hover:shadow-xl"
          >
            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>

            {stat.isProgress ? (
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="w-20 h-20">
                  <CircularProgressbar
                    value={stat.value as number}
                    text={`${stat.value}%`}
                    styles={buildStyles({
                      textColor: "#6C63FF",
                      pathColor: "#6C63FF",
                      trailColor: "#e5e7eb",
                      textSize: "16px",
                    })}
                  />
                </div>
              </div>
            ) : (
              <p className={`mt-4 text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CustomerStats;
