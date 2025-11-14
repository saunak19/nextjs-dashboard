import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
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
import { Users, Package } from "lucide-react";

export const dynamic = "force-dynamic";

// Types
interface FetchedUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface FetchedProduct {
    _id: string;
    name: string;
    price: number;
    sku: string;
    createdAt: string;
}

// Fetch all dashboard-related data
async function getDashboardData() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
            throw new Error("Unauthorized");
        }

        await connectToDB();

        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();

        const recentUsers: FetchedUser[] = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select("-password");

        const recentProducts: FetchedProduct[] = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(5);

        return {
            userCount,
            productCount,
            recentUsers: JSON.parse(JSON.stringify(recentUsers)),
            recentProducts: JSON.parse(JSON.stringify(recentProducts)),
        };
    } catch (error) {
        console.error("Dashboard fetch error:", error);
        return null;
    }
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    if (!data) {
        return (
            <Card className="p-6">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const { userCount, productCount, recentUsers, recentProducts } = data;

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold">Dashboard</h1>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <Card className="rounded-xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{userCount}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{productCount}</p>
                    </CardContent>
                </Card>

            </div>

            {/* RECENT USERS & PRODUCTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Users */}
                <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                        <CardDescription>Latest users who joined.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {recentUsers.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.role === "superadmin"
                                                        ? "destructive"
                                                        : user.role === "admin"
                                                            ? "default"
                                                            : "secondary"
                                                }
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Products */}
                <Card className="rounded-xl shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Products</CardTitle>
                        <CardDescription>Newest items added.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Price</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {recentProducts.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </div>
    );  
}
