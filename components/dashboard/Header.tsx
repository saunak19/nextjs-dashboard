import { UserNav } from "@/components/dashboard/UserNav";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Breadcrumbs } from "./Breadcrumbs";

export default function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 dark:bg-gray-950 md:px-6">

            <MobileSidebar />
            <Breadcrumbs />
            {/* 2. Add the button here */}
            <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <UserNav />
            </div>
        </header>
    );
}