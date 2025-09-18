import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Edit, Plus, Search, Shield, Trash2, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Roles & Permissions', href: '/admin/roles' },
];

type PageProps = {
    roles: Array<{ id: number; name: string; description: string; userCount: number; permissions: string[]; isActive: boolean; createdAt: string }>;
    users: Array<{ id: number; name: string; email: string; role: string; status: string; lastLogin: string; permissions: string }>;
    totalUsers: number;
    activeUsers: number;
    systemPermissions: number;
    availablePermissions: string[];
};

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
    const { props } = usePage<PageProps>();
    const roles = props.roles ?? [];
    const users = props.users ?? [];
    const { put } = useForm({});
    // Access is enforced server-side via middleware; avoid client-side redirect guard that can misfire

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
                            {/* Create Role via modal; removed external Manage Users button */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> New Role
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Role</DialogTitle>
                                    </DialogHeader>
                                    <RoleForm availablePermissions={props.availablePermissions} onSaved={() => router.reload()} />
                                </DialogContent>
                            </Dialog>
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
                            <div className="text-2xl font-bold">{props.totalUsers ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Active Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{props.activeUsers ?? 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">System Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{props.systemPermissions ?? 0}</div>
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
                                    <Link href={route('admin.roles.create')}>
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
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="mr-1 h-3 w-3" /> Edit
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Role</DialogTitle>
                                                            </DialogHeader>
                                                            <RoleEditForm
                                                                role={role}
                                                                availablePermissions={props.availablePermissions}
                                                                onSaved={() => router.reload()}
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
                                                    {role.name !== 'admin' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => {
                                                                if (confirm('Delete this role?')) {
                                                                    router.delete(route('admin.roles.destroy', role.id));
                                                                }
                                                            }}
                                                        >
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
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" /> Add User
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add User</DialogTitle>
                                            </DialogHeader>
                                            <AddUserForm onSaved={() => router.reload()} />
                                        </DialogContent>
                                    </Dialog>
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
                                                <Select
                                                    defaultValue={user.role.toLowerCase()}
                                                    onValueChange={(value) => {
                                                        router.put(route('admin.roles.users.role.update', user.id), { role: value });
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['admin', 'doctor', 'nurse', 'medtech', 'cashier', 'patient'].map((r) => (
                                                            <SelectItem key={r} value={r}>
                                                                {r}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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

function RoleForm({ availablePermissions, onSaved }: { availablePermissions: string[]; onSaved: () => void }) {
    const { data, setData, post, processing, errors } = useForm<{ name: string; permissions: string[] }>({ name: '', permissions: [] });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.roles.store'), { onSuccess: onSaved });
    };
    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="text-sm">Name</label>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
            </div>
            <div>
                <div className="text-sm font-medium">Permissions</div>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {availablePermissions.map((perm) => (
                        <label key={perm} className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.permissions.includes(perm)}
                                onChange={(e) => {
                                    const next = new Set(data.permissions);
                                    if (e.target.checked) next.add(perm);
                                    else next.delete(perm);
                                    setData('permissions', Array.from(next));
                                }}
                            />
                            {perm}
                        </label>
                    ))}
                </div>
                {errors.permissions && <div className="text-sm text-red-600">{String(errors.permissions)}</div>}
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                    Save
                </Button>
            </div>
        </form>
    );
}

function RoleEditForm({
    role,
    availablePermissions,
    onSaved,
}: {
    role: { id: number; name: string; permissions: string[] };
    availablePermissions: string[];
    onSaved: () => void;
}) {
    const { data, setData, put, processing, errors } = useForm<{ name: string; permissions: string[] }>({
        name: role.name,
        permissions: role.permissions || [],
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.roles.update', role.id), { onSuccess: onSaved });
    };
    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="text-sm">Name</label>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
            </div>
            <div>
                <div className="text-sm font-medium">Permissions</div>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {availablePermissions.map((perm) => (
                        <label key={perm} className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.permissions.includes(perm)}
                                onChange={(e) => {
                                    const next = new Set(data.permissions);
                                    if (e.target.checked) next.add(perm);
                                    else next.delete(perm);
                                    setData('permissions', Array.from(next));
                                }}
                            />
                            {perm}
                        </label>
                    ))}
                </div>
                {errors.permissions && <div className="text-sm text-red-600">{String(errors.permissions)}</div>}
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                    Update
                </Button>
            </div>
        </form>
    );
}

function AddUserForm({ onSaved }: { onSaved: () => void }) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role: string;
        is_active: boolean;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'patient',
        is_active: true,
    });
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.roles.users.store'), { onSuccess: onSaved });
    };
    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="text-sm">Name</label>
                <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
            </div>
            <div>
                <label className="text-sm">Email</label>
                <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                    <label className="text-sm">Password</label>
                    <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                    {errors.password && <div className="text-sm text-red-600">{errors.password}</div>}
                </div>
                <div>
                    <label className="text-sm">Confirm Password</label>
                    <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                </div>
            </div>
            <div>
                <label className="text-sm">Role</label>
                <Select defaultValue={data.role} onValueChange={(v) => setData('role', v)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {['admin', 'doctor', 'nurse', 'medtech', 'cashier', 'patient'].map((r) => (
                            <SelectItem key={r} value={r}>
                                {r}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                    Create
                </Button>
            </div>
        </form>
    );
}
