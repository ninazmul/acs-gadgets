"use client";

import { useState, useMemo } from "react";
import { deleteSeller } from "@/lib/actions/seller.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, SortAsc, SortDesc, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const SellerTable = ({
  sellers,
}: {
  sellers: Array<{
    _id: string;
    name: string;
    district: string;
    number: string;
    email: string;
    createdAt: string;
  }>;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "email" | "district" | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredSellers = useMemo(() => {
    const filtered = sellers.filter((seller) =>
      seller.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valueA = a[sortKey]?.toLowerCase?.() || "";
        const valueB = b[sortKey]?.toLowerCase?.() || "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [sellers, searchQuery, sortKey, sortOrder]);

  const paginatedSellers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSellers.slice(start, start + itemsPerPage);
  }, [filteredSellers, currentPage, itemsPerPage]);

  const handleDeleteSeller = async (sellerId: string) => {
    try {
      const response = await deleteSeller(sellerId);
      if (response) {
        toast.success(response.message);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete seller");
      console.log(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleSort = (key: "name" | "email" | "district") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (key: string) =>
    sortKey === key &&
    (sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full max-w-md"
      />

      <Table className="border border-gray-200 rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("name")}
                className="flex items-center gap-1 cursor-pointer"
              >
                Name {renderSortIcon("name")}
              </div>
            </TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("email")}
                className="flex items-center gap-1 cursor-pointer"
              >
                Email {renderSortIcon("email")}
              </div>
            </TableHead>
            <TableHead>Number</TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("district")}
                className="flex items-center gap-1 cursor-pointer"
              >
                District {renderSortIcon("district")}
              </div>
            </TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedSellers.map((seller, index) => (
            <TableRow key={seller._id} className="hover:bg-gray-50">
              <TableCell>
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              <TableCell>
                <a
                  href={`/dashboard/sellers/${seller._id}`}
                  className="text-blue-600 hover:underline"
                >
                  {seller.name}
                </a>
              </TableCell>
              <TableCell>{seller.email}</TableCell>
              <TableCell>{seller.number}</TableCell>
              <TableCell>{seller.district}</TableCell>
              <TableCell>
                {new Date(seller.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex items-center gap-2">
                <a href={`/dashboard/sellers/${seller._id}/update`}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-blue-500"
                  >
                    <Edit2 size={16} />
                  </Button>
                </a>
                <Button
                  onClick={() => setConfirmDeleteId(seller._id)}
                  variant="outline"
                  size="icon"
                  className="text-red-500"
                >
                  <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min(itemsPerPage * currentPage, filteredSellers.length)}{" "}
          of {filteredSellers.length} sellers
        </span>
        <div className="flex items-center gap-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            size="sm"
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage === Math.ceil(filteredSellers.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-[90%] max-w-sm">
            <p className="text-lg font-semibold">
              Are you sure you want to delete this seller?
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
                onClick={() => handleDeleteSeller(confirmDeleteId)}
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

export default SellerTable;
