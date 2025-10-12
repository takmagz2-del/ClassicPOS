"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomerTable from "@/components/customers/CustomerTable";
import CustomerForm from "@/components/customers/CustomerForm";
import EditCustomerForm from "@/components/customers/EditCustomerForm";
import DeleteCustomerDialog from "@/components/customers/DeleteCustomerDialog";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

const initialMockCustomers: Customer[] = [
  { id: "c1", name: "Alice Smith", email: "alice@example.com", phone: "555-111-2222", address: "123 Oak Ave" },
  { id: "c2", name: "Bob Johnson", email: "bob@example.com", phone: "555-333-4444", address: "456 Pine St" },
  { id: "c3", name: "Charlie Brown", email: "charlie@example.com", phone: "555-555-6666", address: "789 Elm Rd" },
];

const Customers = () => {
  const { logout } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(initialMockCustomers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeletingCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCustomer = (customerId: string) => {
    setCustomers((prevCustomers) => prevCustomers.filter((c) => c.id !== customerId));
    toast.success("Customer deleted successfully!");
    setDeletingCustomer(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <CustomerForm onCustomerAdd={handleAddCustomer} onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          {editingCustomer && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Customer</DialogTitle>
                </DialogHeader>
                <EditCustomerForm
                  initialCustomer={editingCustomer}
                  onCustomerUpdate={handleUpdateCustomer}
                  onClose={() => setIsEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}

          {deletingCustomer && (
            <DeleteCustomerDialog
              customer={deletingCustomer}
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
              onConfirm={confirmDeleteCustomer}
            />
          )}

          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerTable
            customers={customers}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;