"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    Settings,
    Package,
    PlusCircle,
    ChevronRight,
    LayoutGrid,
    TextAlignStart,
    ShieldCheck,
    Users
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------- Types ----------------

type NavItemChild = {
    href: string;
    label: string;
    icon: typeof Home;
};

type NavItem = {
    href?: string;
    label: string;
    icon: typeof Home;
    children?: NavItemChild[];
    basePath: string;
    roles?: ('user' | 'admin' | 'superadmin')[];
};

// ---------------- Nav Items ----------------

const allNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home, basePath: "/dashboard" },

    {
        label: "Product",
        icon: Package,
        basePath: "/dashboard/products",
        roles: ["admin", "superadmin"],
        children: [
            {
                href: "/dashboard/products",
                label: "Products",
                icon: TextAlignStart,
            },
            {
                href: "/dashboard/products/new",
                label: "Add Product",
                icon: PlusCircle,
            },
        ],
    },

    {
        href: "/dashboard/categories",
        label: "Categories",
        icon: LayoutGrid,
        basePath: "/dashboard/categories",
        roles: ["admin", "superadmin"],
    },

    {
        href: "/dashboard/admin",
        label: "Admin Panel",
        icon: Users,
        basePath: "/dashboard/admin",
        roles: ["superadmin"],
    },

    {
        href: "/dashboard/superadmin",
        label: "Super Admin",
        icon: ShieldCheck,
        basePath: "/dashboard/superadmin",
        roles: ["superadmin"],
    },

    { href: "/dashboard/billing", label: "Billing", icon: Package, basePath: "/dashboard/billing" },

    { href: "/dashboard/settings", label: "Settings", icon: Settings, basePath: "/dashboard/settings" },
];

// ---------------- Skeleton ----------------

function SidebarSkeleton() {
    return (
        <div className="hidden md:block w-64 border-r bg-white dark:bg-gray-950">
            <div className="flex h-full flex-col">
                <div className="h-16 border-b px-6 flex items-center">
                    <Skeleton className="h-6 w-24" />
                </div>
                <nav className="flex-1 p-4 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </nav>
            </div>
        </div>
    );
}

// ---------------- Main Component ----------------

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const [openCollapsible, setOpenCollapsible] = useState(() =>
        pathname.startsWith("/dashboard/products") ? "Product" : ""
    );

    if (status === "loading") {
        return <SidebarSkeleton />;
    }

    const userRole = session?.user?.role;

    // Filter settings item
    const settingsItem = allNavItems.find(item => item.href === "/dashboard/settings");

    // Filter main items by role
    const mainNavItems = allNavItems
        .filter(item => item.href !== "/dashboard/settings")
        .filter(item => {
            if (!item.roles) return true;
            return item.roles.includes(userRole as any);
        });

    return (
        <div className="hidden md:block w-64 border-r bg-white dark:bg-gray-950">
            <div className="flex h-full flex-col">

                {/* Header */}
                <div className="h-16 border-b px-6 flex items-center">
                    <Link href="/dashboard" className="font-bold text-lg">
                        AI SaaS
                    </Link>
                </div>

                {/* Main Nav */}
                <nav className="flex-1 p-4 space-y-2">
                    {mainNavItems.map(item =>
                        item.children ? (
                            <Collapsible
                                key={item.label}
                                open={openCollapsible === item.label}
                                onOpenChange={() =>
                                    setOpenCollapsible(
                                        openCollapsible === item.label ? "" : item.label
                                    )
                                }
                            >
                                <CollapsibleTrigger
                                    className={cn(
                                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                        "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                                        pathname.startsWith(item.basePath) &&
                                        "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </div>
                                    <ChevronRight
                                        className={cn(
                                            "h-4 w-4 transition-transform",
                                            openCollapsible === item.label && "rotate-90"
                                        )}
                                    />
                                </CollapsibleTrigger>

                                <CollapsibleContent className="pt-2 pl-7 space-y-2">
                                    {item.children.map(child => {
                                        const isActive = pathname === child.href;

                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                                    isActive
                                                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                                                )}
                                            >
                                                <child.icon className="h-4 w-4" />
                                                {child.label}
                                            </Link>
                                        );
                                    })}
                                </CollapsibleContent>
                            </Collapsible>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href!}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                    pathname === item.href
                                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    )}
                </nav>

                {/* Sticky Settings Link */}
                <div className="mt-auto p-4 border-t">
                    {settingsItem && (
                        <Link
                            key={settingsItem.href}
                            href={settingsItem.href!}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                pathname === settingsItem.href
                                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                            )}
                        >
                            <settingsItem.icon className="h-4 w-4" />
                            {settingsItem.label}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
