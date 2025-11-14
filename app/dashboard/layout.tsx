import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900">

            {/* 1. The Sidebar */}
            <Sidebar />

            {/* 2. The Main Content Area (Header + Page) */}
            <div className="flex flex-1 flex-col">

                {/* The Header */}
                <Header />

                {/* The Page Content */}
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}