"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Edit, Trash, Loader2 } from "lucide-react";

interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin" | "superadmin";
}

interface UserActionsProps {
    user: User;
}

export function UserActions({ user }: UserActionsProps) {
    const router = useRouter();
    const { data: session } = useSession();

    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const [editName, setEditName] = useState(user.name);
    const [editRole, setEditRole] = useState(user.role);

    const currentUserId = session?.user?.id;
    const isCurrentUser = user._id === currentUserId;

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(true);

        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, role: editRole }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update user");

            toast.success("User updated successfully");
            setIsEditDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete user");

            toast.success("User deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">
            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User: {user.name}</DialogTitle>
                        <DialogDescription>{user.email}</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEdit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={editRole}
                                onValueChange={(value) =>
                                    setEditRole(value as "user" | "admin" | "superadmin")
                                }
                                disabled={isCurrentUser || session?.user?.role !== "superadmin"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="superadmin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Footer */}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button type="submit" disabled={isEditing}>
                                {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isCurrentUser}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user "{user.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
