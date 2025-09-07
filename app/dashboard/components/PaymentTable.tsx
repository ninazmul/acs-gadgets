"use client";

import { useEffect, useMemo, useState } from "react";
import { deletePayment, updatePayment } from "@/lib/actions/payment.actions";
import { IPayment } from "@/lib/database/models/payment.model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, SortAsc, SortDesc, StickyNote, RefreshCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import PaymentForm from "./PaymentForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ISeller } from "@/lib/database/models/seller.model";
import { getSellerByEmail } from "@/lib/actions/seller.actions";

const progressStatuses = ["Pending", "In Progress", "Paid"];

const PaymentTable = ({
  payments,
  isAdmin,
}: {
  payments: IPayment[];
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "seller" | "amount" | "progress" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sellersMap, setSellersMap] = useState<Record<string, ISeller | null>>(
    {}
  );

  useEffect(() => {
    const uniqueEmails = Array.from(new Set(payments.map((p) => p.seller)));

    const fetchSellers = async () => {
      const results: Record<string, ISeller | null> = {};
      await Promise.all(
        uniqueEmails.map(async (email) => {
          try {
            const seller = await getSellerByEmail(email);
            results[email] = seller || null;
          } catch {
            results[email] = null;
          }
        })
      );
      setSellersMap(results);
    };

    fetchSellers();
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const filtered = payments.filter((payment) =>
      [
        payment.seller,
        payment.amount.toString(),
        payment.paymentMethod,
        payment.accountDetails,
        payment.progress,
      ].some((value) =>
        (value ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA =
          sortKey === "amount" ? a.amount : a[sortKey]?.toLowerCase?.() || "";
        const valueB =
          sortKey === "amount" ? b.amount : b[sortKey]?.toLowerCase?.() || "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [payments, searchQuery, sortKey, sortOrder]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const res = await deletePayment(id);
      if (res) toast.success("Payment deleted successfully.");
      router.refresh();
    } catch {
      toast.error("Failed to delete payment.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleToggleProgress = async (id: string, current: string) => {
    const currentIndex = progressStatuses.indexOf(current);
    const nextStatus =
      progressStatuses[(currentIndex + 1) % progressStatuses.length];
    try {
      await updatePayment(id, { progress: nextStatus });
      toast.success(`Progress updated to "${nextStatus}"`);
      router.refresh();
    } catch {
      toast.error("Failed to update progress.");
    }
  };

  return (
    <div className="space-y-6">
      <Input
        placeholder="Search by any field"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-md"
      />

      <div className="border border-gray-200 rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead
                onClick={() => handleSort("seller")}
                className="cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  Seller{" "}
                  {sortKey === "seller" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Account Details</TableHead>
              <TableHead
                onClick={() => handleSort("progress")}
                className="cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  Progress{" "}
                  {sortKey === "progress" &&
                    (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
                </div>
              </TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPayments.map((payment, idx) => (
              <TableRow key={payment._id} className="hover:bg-gray-100">
                <TableCell>
                  {(currentPage - 1) * itemsPerPage + idx + 1}
                </TableCell>
                <TableCell>
                  {(() => {
                    const seller = sellersMap[payment.seller];
                    return seller ? (
                      <a
                        href={`/dashboard/sellers/${seller._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {seller.name}
                        <div className="text-xs text-muted-foreground">
                          {payment.seller}
                        </div>
                      </a>
                    ) : (
                      <span className="text-red-500">Seller not found</span>
                    );
                  })()}
                </TableCell>
                <TableCell>€{payment.amount}</TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-blue-500"
                      >
                        <StickyNote size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-xs text-sm">
                      {payment.accountDetails || "No note available."}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleToggleProgress(payment._id, payment.progress)
                    }
                    className="text-xs"
                    disabled={!isAdmin}
                  >
                    {payment.progress == "Pending" ? (
                      <div className="border-yellow-400 text-yellow-500 hover:bg-yellow-50 flex items-center gap-1">
                        {payment.progress}
                        {isAdmin && <RefreshCcw className="ml-1 h-3 w-3" />}
                      </div>
                    ) : payment.progress == "In Progress" ? (
                      <div className="border-blue-400 text-blue-500 hover:bg-blue-50 flex items-center gap-1">
                        {payment.progress}
                        {isAdmin && <RefreshCcw className="ml-1 h-3 w-3" />}
                      </div>
                    ) : (
                      <div className="border-green-500 text-green-600 hover:bg-green-50 flex items-center gap-1">
                        {payment.progress}
                        {isAdmin && <RefreshCcw className="ml-1 h-3 w-3" />}
                      </div>
                    )}
                  </Button>
                </TableCell>
                {isAdmin && (
                  <>
                    <TableCell>
                      <div className="flex gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-blue-500"
                            >
                              <Image
                                src="/assets/icons/edit.svg"
                                alt="edit"
                                width={18}
                                height={18}
                              />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="bg-white w-full sm:max-w-md">
                            <SheetHeader>
                              <SheetTitle>Update Payment</SheetTitle>
                              <SheetDescription>
                                Modify this payment&apos;s information.
                              </SheetDescription>
                            </SheetHeader>
                            <div className="py-5">
                              <PaymentForm
                                Payment={payment}
                                PaymentId={payment._id}
                                type="Update"
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                        <Button
                          onClick={() => setConfirmDeleteId(payment._id)}
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredPayments.length)} of{" "}
          {filteredPayments.length} payments
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="rounded-2xl"
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              currentPage === Math.ceil(filteredPayments.length / itemsPerPage)
            }
            className="rounded-2xl"
          >
            Next
          </Button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-80 space-y-4">
            <p className="text-center text-sm">
              Are you sure you want to delete this payment?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeletePayment(confirmDeleteId!)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;
