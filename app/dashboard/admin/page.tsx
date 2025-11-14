import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
import { UserActions } from "./UserActions";

export const dynamic = "force-dynamic";

interface FetchedUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'superadmin';
    createdAt: string;
}

async function getUsers() {
    await connectToDB();
    const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(users));
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin' && session?.user?.role !== 'superadmin') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Forbidden</CardTitle>
                    <CardDescription>
                        You do not have permission to view this page.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const users: FetchedUser[] = await getUsers();

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold">User Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        A list of all registered users in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                user.role === 'superadmin' ? 'destructive' :
                                                    user.role === 'admin' ? 'default' : 'secondary'
                                            }>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <UserActions user={user} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No users found.
                                        S      </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}