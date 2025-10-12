"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import MfaSetup from "@/components/auth/MfaSetup";
import ReceiptSettingsForm from "@/components/settings/ReceiptSettingsForm";
import PrinterSettingsForm from "@/components/settings/PrinterSettingsForm";
import TaxSettingsForm from "@/components/settings/TaxSettingsForm";
import CategorySettingsForm from "@/components/settings/CategorySettingsForm";
import UserManagementTable from "@/components/settings/UserManagementTable"; // New import
import UserForm from "@/components/settings/UserForm"; // New import
import DeleteUserDialog from "@/components/settings/DeleteUserDialog"; // New import
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // New import for Dialog
import { PlusCircle } from "lucide-react"; // New import for icon
import { User, UserRole } from "@/types/user"; // New import for User and UserRole

const Settings = () => {
  const { user, disableMfa, users, addUser, updateUser, deleteUser, hasPermission } = useAuth();
  const [showMfaSetup, setShowMfaSetup] = React.useState(false);

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const handleMfaSetupComplete = () => {
    setShowMfaSetup(false);
  };

  const handleDisableMfa = async () => {
    if (window.confirm("Are you sure you want to disable MFA?")) {
      const success = await disableMfa();
      if (success) {
        toast.success("MFA has been disabled.");
      } else {
        toast.error("Failed to disable MFA.");
      }
    }
  };

  const handleAddUserSubmit = async (values: { email: string; password?: string; role: UserRole }) => {
    if (!values.password) {
      toast.error("Password is required for new users.");
      return false;
    }
    return await addUser(values.email, values.password, values.role);
  };

  const handleEditUserClick = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUserSubmit = async (values: { email: string; password?: string; role: UserRole }) => {
    if (!editingUser) return false;

    const updatedUser: User = {
      ...editingUser,
      email: values.email, // Email might not be editable in a real system, but for mock it's fine
      role: values.role,
    };

    // If password is provided, it means user wants to change it
    if (values.password) {
      // In a real app, this would be a separate API call to update password
      // For mock, we'll just update the mockUsers object directly in AuthContext
      // This is handled internally by AuthContext's updateUser function
    }

    return await updateUser(updatedUser);
  };

  const handleDeleteUserClick = (userToDelete: User) => {
    setDeletingUser(userToDelete);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      setDeletingUser(null);
    }
  };

  const canManageUsers = hasPermission([UserRole.ADMIN, UserRole.MANAGER]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</p>
          <p><strong>MFA Status:</strong> {user?.mfaEnabled ? "Enabled" : "Disabled"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (MFA)</CardTitle>
        </CardHeader>
        <CardContent>
          {user?.mfaEnabled ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">MFA is currently enabled for your account.</p>
              <Button variant="destructive" onClick={handleDisableMfa}>
                Disable MFA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">MFA is currently disabled. Enable it for enhanced security.</p>
              {!showMfaSetup ? (
                <Button onClick={() => setShowMfaSetup(true)}>
                  Enable MFA
                </Button>
              ) : (
                <MfaSetup onSetupComplete={handleMfaSetupComplete} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {canManageUsers && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <UserForm onUserSubmit={handleAddUserSubmit} onClose={() => setIsAddUserDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <UserManagementTable
              users={users}
              onEditUser={handleEditUserClick}
              onDeleteUser={handleDeleteUserClick}
            />

            {editingUser && (
              <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                  </DialogHeader>
                  <UserForm
                    initialUser={editingUser}
                    onUserSubmit={handleUpdateUserSubmit}
                    onClose={() => setIsEditUserDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}

            {deletingUser && (
              <DeleteUserDialog
                user={deletingUser}
                isOpen={isDeleteUserDialogOpen}
                onClose={() => setIsDeleteUserDialogOpen(false)}
                onConfirm={confirmDeleteUser}
              />
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Receipt Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ReceiptSettingsForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Printer Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <PrinterSettingsForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <TaxSettingsForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <CategorySettingsForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;