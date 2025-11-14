import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Category from '@/models/Category';
import Product from "@/models/Product";
import User from "@/models/User";
import { ProductActions } from "@/app/components/dashboard/products/ProductActions";
// ... (all your other imports)
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
export const dynamic = "force-dynamic";

// --- 1. UPDATE THIS FUNCTION ---
async function getProductsForUser(userId: string, userRole: string) { // <-- Add userRole
    try {
        await connectToDB();

        // Create a query object
        let query = {};

        // If the user is a 'user', only find their own products.
        // If they are 'admin' or 'superadmin', the query will be empty ({}),
        // which means "find all products".
        if (userRole === 'user') {
            query = { user: userId };
        }

        const products = await Product.find(query) // <-- Use the dynamic query
            .populate('categories', 'name')
            .populate('user', 'name email') // <-- Also populate user info
            .sort({ createdAt: -1 });

        return products;
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

function formatPrice(price: number) {
    // ... (no change)
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(price);
}

export default async function ProductsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        // ... (no change)
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>
                        You must be logged in to view this page.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    await connectToDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
        // ... (no change)
        return <Card><CardHeader><CardTitle>User not found.</CardTitle></CardHeader></Card>;
    }

    // --- 2. UPDATE THIS CALL ---
    // Pass the user's role to the fetching function
    const products = await getProductsForUser(user._id, user.role);

    return (
        <div className="flex flex-col gap-6">
            {/* ... (no change to header/button) ... */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Products Inventory</h1>
                <Button asChild>
                    <Link href="/dashboard/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Product
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    {/* ... (no change) ... */}
                    <CardTitle>Product List</CardTitle>
                    <CardDescription>
                        A list of all products in your inventory.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                {/* We can also add an "Author" column now */}
                                {user.role !== 'user' && (
                                    <TableHead>Author</TableHead>
                                )}
                                <TableHead>SKU</TableHead>
                                <TableHead>Categories</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product._id.toString()}>
                                        <TableCell className="font-medium">{product.name}</TableCell>

                                        {/* Show product author if admin/superadmin */}
                                        {user.role !== 'user' && (
                                            <TableCell>{product.user?.name || 'N/A'}</TableCell>
                                        )}

                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {product.categories && product.categories.length > 0 ? (
                                                    product.categories.map((category: any) => ( // Use 'any' or define type
                                                        <Badge key={category._id} variant="secondary" className="text-xs">
                                                            {category.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No categories</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {/* ... (no change to stock) ... */}
                                            {product.stockQuantity > 0 ? (
                                                <Badge variant={product.stockQuantity < 10 ? "destructive" : "outline"}>
                                                    {product.stockQuantity}
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">Out of Stock</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatPrice(product.price)}</TableCell>
                                        <TableCell>
                                            {new Date(product.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ProductActions productId={product._id.toString()} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={user.role !== 'user' ? 8 : 7} className="text-center"> {/* Update colSpan */}
                                        You have not added any products yet.
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