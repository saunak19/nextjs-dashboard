"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Loader2 } from "lucide-react";

interface Category {
    _id: string;
    name: string;
    parent?: string;
}

export default function EditProductPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [sku, setSku] = useState("");
    const [stockQuantity, setStockQuantity] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    // Fetch categories and product data
    useEffect(() => {
        const fetchData = async () => {
            setIsPageLoading(true);
            setCategoriesLoading(true);

            try {
                // Fetch categories
                const categoriesRes = await fetch("/api/categories");
                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    setCategories(categoriesData);
                } else {
                    throw new Error("Failed to fetch categories");
                }

                // Fetch product data
                if (id && id.length > 5) {
                    const productRes = await fetch(`/api/products/${id}`);
                    if (!productRes.ok) {
                        throw new Error("Failed to fetch product data");
                    }
                    const productData = await productRes.json();

                    setName(productData.name);
                    setDescription(productData.description);
                    setPrice(productData.price.toString());
                    setSku(productData.sku);
                    setStockQuantity(productData.stockQuantity.toString());

                    // Set existing categories
                    if (productData.categories && productData.categories.length > 0) {
                        setSelectedCategories(productData.categories.map((cat: any) =>
                            typeof cat === 'object' ? cat._id : cat
                        ));
                    }
                }
            } catch (error) {
                toast.error((error as Error).message);
                router.push("/dashboard/products");
            } finally {
                setIsPageLoading(false);
                setCategoriesLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Add validation for categories
        if (selectedCategories.length === 0) {
            toast.error("Please select at least one category");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    sku,
                    stockQuantity: parseInt(stockQuantity),
                    categories: selectedCategories, // Add categories to request
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to update product");
            }

            toast.success("Product updated successfully!");
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

    if (isPageLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading product data...</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-start py-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Edit Product</CardTitle>
                    <CardDescription>
                        Update the details for your product.
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
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Add Categories Section */}
                        <div className="space-y-2">
                            <Label htmlFor="categories">Categories</Label>
                            <Select
                                onValueChange={handleCategoryChange}
                                disabled={categoriesLoading}
                            >
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
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
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
                                required
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Saving Changes..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}