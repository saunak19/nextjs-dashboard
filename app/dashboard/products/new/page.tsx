"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "react-toastify";
export const dynamic = "force-dynamic";

interface Category {
    _id: string;
    name: string;
    parent?: string;
}

export default function AddProductPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [sku, setSku] = useState("");
    const [stockQuantity, setStockQuantity] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const router = useRouter();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                } else {
                    throw new Error("Failed to fetch categories");
                }
            } catch (error) {
                toast.error("Failed to load categories");
                console.error(error);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Add validation for categories
        if (selectedCategories.length === 0) {
            toast.error("Please select at least one category");
            return;
        }
        console.log("Submitting with categories:", selectedCategories);
        setIsLoading(true);

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    sku,
                    stockQuantity: parseInt(stockQuantity),
                    categories: selectedCategories, // Make sure this is included
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to add product");
            }

            toast.success("Product added successfully!");
            router.push("/dashboard/products");
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryChange = (value: string) => {
        if (value && !selectedCategories.includes(value)) {
            setSelectedCategories([...selectedCategories, value]);
        }
    };

    const removeCategory = (categoryId: string) => {
        setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : "Unknown Category";
    };

    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                    <CardDescription>
                        Fill out the form to add a new product to your inventory.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Wireless Headphones"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. High-quality sound, 20-hour battery life..."
                                required
                            />
                        </div>

                        {/* Add Categories Section */}
                        <div className="space-y-2">
                            <Label htmlFor="categories">Categories</Label>
                            <Select onValueChange={handleCategoryChange} disabled={categoriesLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select categories"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Selected Categories Display */}
                            {selectedCategories.length > 0 && (
                                <div className="mt-3">
                                    <Label>Selected Categories:</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedCategories.map((categoryId) => (
                                            <div
                                                key={categoryId}
                                                className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {getCategoryName(categoryId)}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCategory(categoryId)}
                                                    className="hover:bg-primary-foreground hover:text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="e.g. 99.99"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                                <Input
                                    id="sku"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="e.g. WH-1000XM4"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(e.target.value)}
                                placeholder="e.g. 150"
                                required
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Saving..." : "Save Product"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}