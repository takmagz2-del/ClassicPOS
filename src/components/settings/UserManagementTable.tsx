"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User, UserRole } from "@/types/user";
import { Edit, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

interface UserManagementTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

const UserManagementTable = ({ users, onEditUser, onDeleteUser }: UserManagementTableProps) => {
  const { user: currentUser } = useAuth();

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><ShieldCheck className="h-4 w-4" /> Admin</span>;
      case UserRole.MANAGER:
        return <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><ShieldCheck className="h-4 w-4" /> Manager</span>;
      case UserRole.EMPLOYEE:
        return <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><ShieldAlert className="h-4 w-4" /> Employee</span>;
      default:
        return role;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-center">MFA Enabled</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{getRoleDisplay(user.role)}</TableCell>
                <TableCell className="text-center">
                  {user.mfaEnabled ? "Yes" : "No"}
                </TableCell>
                <TableCell className="text-center flex justify-center items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onEditUser(user)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteUser(user)}
                    disabled={currentUser?.id === user.id} // Prevent user from deleting their own account
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementTable;