import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Search, Shield, Trash2, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Roles & Permissions', href: '/admin/roles' },
];

// Mock data - in real app this would come from props
const roles = [
    {
        id: 1,
        name: 'Admin',
        description: 'Full system access and control',
        userCount: 2,
        permissions: ['All Access'],
        isActive: true,
        createdAt: '2025-01-01',
    },
    {
        id: 2,
        name: 'Doctor',
        description: 'Medical staff with patient and appointment access',
        userCount: 5,
        permissions: ['Patients', 'Appointments', 'Medical Records'],
        isActive: true,
        createdAt: '2025-01-01',
    },
    {
        id: 3,
        name: 'Laboratory Technologist',
        description: 'Lab staff with laboratory test management access',
        userCount: 3,
        permissions: ['Patients', 'Laboratory', 'Test Results'],
        isActive: true,
        createdAt: '2025-01-01',
    },
    {
        id: 4,
        name: 'Cashier',
        description: 'Financial staff with billing and payment access',
        userCount: 2,
        permissions: ['Patients', 'Billing', 'Payments'],
        isActive: true,
        createdAt: '2025-01-01',
    },
    {
        id: 5,
        name: 'Patient',
        description: 'Patient access to personal health information',
        userCount: 156,
        permissions: ['Personal Records', 'Appointments', 'Test Results'],
        isActive: true,
        createdAt: '2025-01-01',
    },
];

const users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@clinic.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2025-04-24 10:30 AM',
        permissions: 'Full Access',
    },
    {
        id: 2,
        name: 'Dr. John Smith',
        email: 'doctor@clinic.com',
        role: 'Doctor',
        status: 'Active',
        lastLogin: '2025-04-24 09:15 AM',
        permissions: 'Patients, Appointments',
    },
    {
        id: 3,
        name: 'Sarah Johnson',
        email: 'labtech@clinic.com',
        role: 'Laboratory Technologist',
        status: 'Active',
        lastLogin: '2025-04-24 08:45 AM',
        permissions: 'Laboratory, Patients',
    },
    {
        id: 4,
        name: 'Mike Wilson',
        email: 'cashier@clinic.com',
        role: 'Cashier',
        status: 'Active',
        lastLogin: '2025-04-24 08:30 AM',
        permissions: 'Billing, Patients',
    },
];

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Active: 'bg-green-100 text-green-800',
        Inactive: 'bg-red-100 text-red-800',
        Pending: 'bg-yellow-100 text-yellow-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

const getRoleBadge = (role: string) => {
    const roleConfig = {
        Admin: 'bg-purple-100 text-purple-800',
        Doctor: 'bg-blue-100 text-blue-800',
        'Laboratory Technologist': 'bg-green-100 text-green-800',
        Cashier: 'bg-orange-100 text-orange-800',
        Patient: 'bg-gray-100 text-gray-800',
    };

    return roleConfig[role as keyof typeof roleConfig] || 'bg-gray-100 text-gray-800';
};

export default function RolesIndex() {
    const { permissions, canAccessModule } = useRoleAccess();

    // Redirect if user doesn't have access to settings
    if (!permissions.canAccessSettings) {
        router.visit('/admin/dashboard');
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions Management" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
                            <p className="text-gray-500">Manage user roles, permissions, and system access control</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                New Role
                            </Button>
                            <Button>
                                <Users className="mr-2 h-4 w-4" />
                                Manage Users
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{roles.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">168</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">165</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">System Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Roles Management */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-purple-500" />
                                        System Roles
                                    </CardTitle>
                                    <CardDescription>Manage user roles and their associated permissions</CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href="/admin/roles/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Role
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-purple-500" />
                                                    <span className="font-medium">{role.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs">{role.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{role.userCount} users</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.map((permission, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadge(role.isActive ? 'Active' : 'Inactive')}>
                                                    {role.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{role.createdAt}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/roles/${role.id}/edit`}>
                                                            <Edit className="mr-1 h-3 w-3" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    {role.name !== 'Admin' && (
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="mr-1 h-3 w-3" />
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* User Management */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        User Accounts
                                    </CardTitle>
                                    <CardDescription>Manage user accounts and their role assignments</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                        <Input placeholder="Search users..." className="w-64 pl-8" />
                                    </div>
                                    <Button variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add User
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="text-sm text-gray-600">{user.permissions}</div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">{user.lastLogin}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/users/${user.id}/edit`}>
                                                            <Edit className="mr-1 h-3 w-3" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/users/${user.id}/permissions`}>
                                                            <Shield className="mr-1 h-3 w-3" />
                                                            Permissions
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Permission Matrix */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-500" />
                                Permission Matrix
                            </CardTitle>
                            <CardDescription>Overview of permissions for each role</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Admin</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Lab Tech</TableHead>
                                            <TableHead>Cashier</TableHead>
                                            <TableHead>Patient</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Dashboard</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-100 text-blue-800">Role-Specific</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-100 text-blue-800">Role-Specific</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-100 text-blue-800">Role-Specific</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-gray-100 text-gray-800">Patient Only</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Patients</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">View/Edit</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">View/Edit</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">View/Edit</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Laboratory</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Billing</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Appointments</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-100 text-green-800">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-red-100 text-red-800">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-100 text-blue-800">View Own</Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
