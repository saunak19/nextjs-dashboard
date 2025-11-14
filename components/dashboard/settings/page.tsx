// app/dashboard/settings/page.tsx
"use client"; // Still a client component for future settings

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; // From shadcn
import { Input } from "@/components/ui/input"; // Example
import { Button } from "@/components/ui/button"; // Example

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        Update your public profile information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                        <Input id="name" placeholder="Enter your name" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    <Button>Update Profile</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                        Change your password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="current-password">Current Password</label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="new-password">New Password</label>
                        <Input id="new-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                </CardContent>
            </Card>
        </div>
    );
}