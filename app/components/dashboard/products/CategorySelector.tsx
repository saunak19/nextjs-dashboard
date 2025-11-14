"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// API Category Type
type ApiCategory = {
    _id: string;
    name: string;
    parent?: {
        _id: string;
        name: string;
    };
};

// Formatted Category Type
type FormattedCategory = {
    _id: string;
    name: string; // Includes parent → child
};

interface CategorySelectorProps {
    selectedCategories: string[];
    onChange: (selectedIds: string[]) => void;
}

export function CategorySelector({ selectedCategories, onChange }: CategorySelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [formattedCategories, setFormattedCategories] = React.useState<FormattedCategory[]>([]);

    React.useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);

            try {
                const res = await fetch("/api/categories");
                if (!res.ok) throw new Error("Failed to fetch categories");

                const data: ApiCategory[] = await res.json();

                const formatted = data
                    .map((cat) => ({
                        _id: cat._id,
                        name: cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name,
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setFormattedCategories(formatted);
            } catch (error) {
                toast.error((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSelect = (categoryId: string) => {
        const newSelection = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];

        onChange(newSelection);
    };

    const selectedCategoryLabels = formattedCategories
        .filter((cat) => selectedCategories.includes(cat._id))
        .map((cat) => cat.name)
        .join(", ");

    // Loading skeleton
    if (isLoading) {
        return <Skeleton className="h-10 w-full" />;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span className="truncate">
                        {selectedCategoryLabels || "Select categories..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>

                        <CommandGroup>
                            {formattedCategories.map((category) => (
                                <CommandItem
                                    key={category._id}
                                    value={category.name}
                                    onSelect={() => handleSelect(category._id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCategories.includes(category._id)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {category.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
