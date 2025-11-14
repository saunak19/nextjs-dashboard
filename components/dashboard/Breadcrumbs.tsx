"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Helper function to capitalize strings
const capitalize = (s: string) => {
    if (!s) return "";
    const formatted = s.replace(/-/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function Breadcrumbs() {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(segment => segment);

    // Build breadcrumb items
    const items = pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;

        let name = capitalize(segment);
        if (name === 'New') name = 'Add New';

        return { href, name, isLast };
    });

    return (
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {items.map((item, index) => {
                    // This is the fix:
                    // We filter out the "Dashboard" item *before* returning anything.
                    if (item.name === 'Dashboard') return null;

                    return (
                        <React.Fragment key={item.href}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {item.isLast ? (
                                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.name}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}