"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Video, Settings, Package, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/videos", label: "Videos", icon: Video },
    { href: "/dashboard/billing", label: "Billing", icon: Package },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function MobileSidebar() {
    const pathname = usePathname();

    return (
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <div className="flex h-full flex-col">

                        <div className="h-16 border-b px-6 flex items-center">
                            <Link href="/dashboard" className="font-bold text-lg">
                                My SaaS App
                            </Link>
                        </div>

                        <nav className="flex-1 p-4 space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                            isActive
                                                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}