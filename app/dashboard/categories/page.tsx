"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, PlusCircle, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface PopulatedCategory {
    _id: string;
    name: string;
    parent?: PopulatedCategory | null;
}

export default function CategoriesPage() {
    const [name, setName] = useState("");
    const [parentCategory, setParentCategory] = useState("none");
    const [categories, setCategories] = useState<PopulatedCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [editingCategory, setEditingCategory] = useState<PopulatedCategory | null>(null);
    const [editName, setEditName] = useState("");
    const [editParent, setEditParent] = useState("none");
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const router = useRouter();

    const fetchCategories = async () => {
        try {
            setIsFetching(true);
            const res = await fetch("/api/categories");
            if (!res.ok) throw new Error("Failed to fetch categories");

            const data: PopulatedCategory[] = await res.json();
            setCategories(data);
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    parent: parentCategory === "none" ? null : parentCategory,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to create category");
            }

            toast.success("Category created successfully!");
            setName("");
            setParentCategory("none");
            fetchCategories();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        setIsEditLoading(true);

        try {
            const res = await fetch(`/api/categories/${editingCategory._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editName,
                    parent: editParent === "none" ? null : editParent,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to update category");
            }

            toast.success("Category updated successfully!");

            setEditingCategory(null);
            setEditName("");
            setEditParent("none");
            fetchCategories();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsEditLoading(false);
        }
    };

    const handleDelete = async (categoryId: string) => {
        setIsDeleteLoading(true);

        try {
            const res = await fetch(`/api/categories/${categoryId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData = await res.json();

                if (errorData.details && errorData.details.productCount > 0) {
                    const productList = errorData.details.productNames.join(", ");
                    const moreText =
                        errorData.details.totalProducts > 5
                            ? ` and ${errorData.details.totalProducts - 5} more...`
                            : "";

                    toast.error(
                        `Cannot delete category. It is used by ${errorData.details.totalProducts} product(s) including: ${productList}${moreText}. Remove this category from products first.`
                    );
                } else {
                    throw new Error(errorData.message || "Failed to delete category");
                }
                return;
            }

            toast.success("Category deleted successfully!");
            fetchCategories();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsDeleteLoading(false);
        }
    };

    const openEditDialog = (category: PopulatedCategory) => {
        setEditingCategory(category);
        setEditName(category.name);
        setEditParent(category.parent?._id || "none");
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold">Categories</h1>

            {/* CREATE CATEGORY */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Category</CardTitle>
                    <CardDescription>
                        Add a new category or subcategory for your products.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* NAME */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Electronics"
                                required
                            />
                        </div>

                        {/* PARENT */}
                        <div className="space-y-2">
                            <Label>Parent Category (Optional)</Label>
                            <Select value={parentCategory} onValueChange={setParentCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a parent category" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="none">-- None (Top-Level) --</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <PlusCircle className="mr-2 h-4 w-4" />
                            )}
                            Create Category
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* CATEGORY LIST */}
            <Card>
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Parent Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isFetching ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : categories.length > 0 ? (
                                categories.map((cat) => (
                                    <TableRow key={cat._id}>
                                        <TableCell className="font-medium">
                                            {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                                        </TableCell>

                                        <TableCell>
                                            {cat.parent ? cat.parent.name : "None (Top-Level)"}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* EDIT */}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEditDialog(cat)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>

                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Category</DialogTitle>
                                                            <DialogDescription>
                                                                Update category details.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <form onSubmit={handleEdit} className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label>Category Name</Label>
                                                                <Input
                                                                    value={editName}
                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label>Parent Category</Label>
                                                                <Select
                                                                    value={editParent}
                                                                    onValueChange={setEditParent}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select parent" />
                                                                    </SelectTrigger>

                                                                    <SelectContent>
                                                                        <SelectItem value="none">-- None --</SelectItem>
                                                                        {categories
                                                                            .filter((c) => c._id !== editingCategory?._id)
                                                                            .map((category) => (
                                                                                <SelectItem
                                                                                    key={category._id}
                                                                                    value={category._id}
                                                                                >
                                                                                    {category.parent
                                                                                        ? `${category.parent.name} > ${category.name}`
                                                                                        : category.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="flex justify-end gap-2">
                                                                <DialogClose asChild>
                                                                    <Button type="button" variant="outline">
                                                                        Cancel
                                                                    </Button>
                                                                </DialogClose>

                                                                <Button type="submit" disabled={isEditLoading}>
                                                                    {isEditLoading && (
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    )}
                                                                    Update Category
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>

                                                {/* DELETE */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete "{cat.name}".
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>

                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>

                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(cat._id)}
                                                                disabled={isDeleteLoading}
                                                                className="bg-destructive hover:bg-destructive/90"
                                                            >
                                                                {isDeleteLoading && (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                )}
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        You have not created any categories yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
