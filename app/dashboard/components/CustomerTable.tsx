"use client";

import { useState, useMemo } from "react";
import { deleteCustomer } from "@/lib/actions/customer.actions";
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

const CustomerTable = ({
  customers,
}: {
  customers: Array<{
    _id: string;
    name: string;
    district: string;
    number: string;
    email: string;
    createdAt: string;
    addedBy: string;
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

  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [customers, searchQuery, sortKey, sortOrder]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const response = await deleteCustomer(customerId);
      if (response) {
        toast.success(response.message);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to delete customer");
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

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full md:w-1/2 lg:w-1/3"
      />

      <Table className="border border-gray-200 rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>
              <div
                onClick={() => handleSort("name")}
                className="flex items-center gap-2 cursor-pointer"
              >
                Name
                {sortKey === "name" &&
                  (sortOrder === "asc" ? <SortAsc /> : <SortDesc />)}
              </div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedCustomers.map((customer, index) => (
            <TableRow key={customer._id} className="hover:bg-gray-100">
              <TableCell>
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>
              <TableCell>
                <a href={`/dashboard/customers/${customer._id}`}>
                  {customer.name}
                </a>
              </TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.number}</TableCell>
              <TableCell>{customer.district}</TableCell>
              <TableCell>{customer.addedBy}</TableCell>
              <TableCell>
                {new Date(customer.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex items-center space-x-2">
                <a href={`/dashboard/customers/${customer._id}/update`}>
                  <Button variant="outline" className="text-blue-500">
                    <Edit2 size={16} />
                  </Button>
                </a>
                <Button
                  onClick={() => setConfirmDeleteId(customer._id)}
                  variant={"outline"}
                  className="text-red-500"
                >
                  <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, filteredCustomers.length)} of{" "}
          {filteredCustomers.length} customers
        </span>
        <div className="flex items-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            size="sm"
          >
            Previous
          </Button>
          <Button
            disabled={
              currentPage === Math.ceil(filteredCustomers.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md space-y-4 max-w-sm w-full">
            <p className="text-lg font-semibold">
              Are you sure you want to delete this customer?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setConfirmDeleteId(null)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteCustomer(confirmDeleteId)}
                variant="destructive"
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

export default CustomerTable;
