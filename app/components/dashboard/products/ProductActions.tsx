"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

// --- 1. Import Dialog components ---
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

// --- 2. Import other components we need for the popup ---
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Loader2, Eye } from "lucide-react";

// Helper type for our product data
interface Product {
    _id: string;
    name: string;
    sku: string;
    description: string;
    price: number;
    stockQuantity: number;
    createdAt: string;
    categories: Array<{ // ADD THIS
        _id: string;
        name: string;
    }>;
}

// Helper function to format price
function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}

interface ProductActionsProps {
    productId: string;
}

export function ProductActions({ productId }: ProductActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    // --- 3. Add new state for the View popup ---
    const [product, setProduct] = useState<Product | null>(null);
    const [isViewing, setIsViewing] = useState(false);

    // This is your existing Delete function (no changes)
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete product");
            toast.success("Product deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsDeleting(false);
        }
    };

    // --- 4. Add a new function to load data for the popup ---
    const handleOpenView = async () => {
        setIsViewing(true);
        try {
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch product details");
            }
            const data = await res.json();
            setProduct(data);
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsViewing(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2">

            {/* --- 5. This is the new View Button & Dialog --- */}
            <Dialog onOpenChange={(open) => {
                if (open && !product) {
                    handleOpenView();
                }
            }}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Product Details</DialogTitle>
                        <DialogDescription className="text-base">
                            Complete information about your product
                        </DialogDescription>
                    </DialogHeader>

                    {isViewing ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-lg text-muted-foreground">Loading product details...</p>
                        </div>
                    ) : product ? (
                        <div className="space-y-6 py-2">
                            {/* Header Section */}
                            <div className="flex items-start justify-between border-b pb-4">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{product.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="font-medium">SKU: {product.sku}</span>
                                        <span>•</span>
                                        <span>Added: {new Date(product.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {product.stockQuantity > 0 ? (
                                        <Badge
                                            variant={product.stockQuantity < 10 ? "destructive" : "default"}
                                            className="text-sm px-3 py-1"
                                        >
                                            {product.stockQuantity} in stock
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="text-sm px-3 py-1">
                                            Out of Stock
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">Price</span>
                                    <span className="text-3xl font-bold text-primary">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                            </div>

                            {/* Categories Section */}
                            <div className="space-y-3">
                                <h4 className="text-lg font-semibold flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    Categories
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.categories && product.categories.length > 0 ? (
                                        product.categories.map((category) => (
                                            <Badge
                                                key={category._id}
                                                variant="secondary"
                                                className="px-3 py-1.5 text-sm bg-secondary/80 hover:bg-secondary"
                                            >
                                                {category.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <div className="text-center w-full py-4">
                                            <span className="text-muted-foreground italic">
                                                No categories assigned to this product
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-3">
                                <h4 className="text-lg font-semibold flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    Description
                                </h4>
                                <div className="bg-muted/30 rounded-lg p-4 min-h-[80px]">
                                    <p className="text-foreground leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <Eye className="h-8 w-8 text-destructive" />
                            </div>
                            <div className="text-center space-y-2">
                                <h4 className="text-lg font-semibold text-destructive">Failed to load</h4>
                                <p className="text-muted-foreground">Could not load product details. Please try again.</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex sm:justify-between gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="flex-1">
                                Close
                            </Button>
                        </DialogClose>
                        <Button asChild className="flex-1">
                            <Link href={`/dashboard/products/edit/${productId}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* --- Delete Button (Unchanged) --- */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this
                            product.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}