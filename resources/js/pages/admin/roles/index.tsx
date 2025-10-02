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
import Heading from '@/components/heading';

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

const getStatusVariant = (status: string): 'success' | 'destructive' | 'warning' | 'secondary' => {
    switch (status) {
        case 'Active':
            return 'success';
        case 'Inactive':
            return 'destructive';
        case 'Pending':
            return 'warning';
        default:
            return 'secondary';
    }
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
                        <Heading title="Roles & Permissions" description="Manage user roles, permissions, and system access control" icon={Shield} />
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

                {/* Stats Cards - Styled like Lab Diagnostics cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="flex h-28">
                            <div className="w-24 h-full bg-purple-500 flex items-center justify-center rounded-l-xl">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 p-4">
                                <div className="text-2xl font-bold text-gray-900">{roles.length}</div>
                                <div className="text-sm text-gray-600 mb-1">Total Roles</div>
                                <div className="text-xs text-gray-500">Configured role types</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="flex h-28">
                            <div className="w-24 h-full bg-blue-500 flex items-center justify-center rounded-l-xl">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 p-4">
                                <div className="text-2xl font-bold text-gray-900">{props.totalUsers ?? 0}</div>
                                <div className="text-sm text-gray-600 mb-1">Total Users</div>
                                <div className="text-xs text-gray-500">All registered users</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="flex h-28">
                            <div className="w-24 h-full bg-green-500 flex items-center justify-center rounded-l-xl">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 p-4">
                                <div className="text-2xl font-bold text-gray-900">{props.activeUsers ?? 0}</div>
                                <div className="text-sm text-gray-600 mb-1">Active Users</div>
                                <div className="text-xs text-gray-500">Currently active accounts</div>
                            </div>
                        </div>
                    </div>

                    <div className="holographic-card bg-white shadow-sm cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="flex h-28">
                            <div className="w-24 h-full bg-orange-500 flex items-center justify-center rounded-l-xl">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1 p-4">
                                <div className="text-2xl font-bold text-gray-900">{props.systemPermissions ?? 0}</div>
                                <div className="text-sm text-gray-600 mb-1">System Permissions</div>
                                <div className="text-xs text-gray-500">Available permissions</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Roles Management */}
                <div className="mb-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                <div>
                                        <h3 className="text-2xl font-bold text-white">System Roles</h3>
                                        <p className="text-purple-100 mt-1">Manage user roles and their associated permissions</p>
                                    </div>
                                </div>
                                <Button asChild className="bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                    <Link href={route('admin.roles.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Role
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
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
                                                <Badge variant={getStatusVariant(role.isActive ? 'Active' : 'Inactive')}>
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
                                                        <DialogContent className="p-0 overflow-hidden rounded-xl">
                                                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                                                <div className="flex items-center gap-3 p-6">
                                                                    <div className="p-2 bg-white/20 rounded-lg">
                                                                        <Shield className="h-6 w-6" />
                                                                    </div>
                                                                    <div>
                                                                        <DialogTitle className="text-2xl font-bold text-white">Edit Role</DialogTitle>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                                                            <DialogHeader>
                                                                <DialogTitle className="sr-only">Edit Role</DialogTitle>
                                                            </DialogHeader>
                                                            <RoleEditForm
                                                                role={role}
                                                                availablePermissions={props.availablePermissions}
                                                                onSaved={() => router.reload()}
                                                            />
                                                            </div>
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
                        </div>
                    </div>
                </div>

                {/* User Management */}
                <div className="mb-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Users className="h-6 w-6" />
                                    </div>
                                <div>
                                        <h3 className="text-2xl font-bold text-white">User Accounts</h3>
                                        <p className="text-blue-100 mt-1">Manage user accounts and their role assignments</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-white/80" />
                                        <Input placeholder="Search users..." className="w-64 pl-8 bg-white text-gray-900" />
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                                <Plus className="mr-2 h-4 w-4" /> Add User
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="p-0 overflow-hidden rounded-xl">
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                                <div className="flex items-center gap-3 p-6">
                                                    <div className="p-2 bg-white/20 rounded-lg">
                                                        <Users className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <DialogTitle className="text-2xl font-bold text-white">Add User</DialogTitle>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                                            <DialogHeader>
                                                    <DialogTitle className="sr-only">Add User</DialogTitle>
                                            </DialogHeader>
                                            <AddUserForm onSaved={() => router.reload()} />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
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
                                                <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
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
                        </div>
                    </div>
                </div>

                {/* Permission Matrix */}
                <div className="mb-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Permission Matrix</h3>
                                    <p className="text-emerald-100 mt-1">Overview of permissions for each role</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-emerald-50 to-green-100">
                            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
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
                                                <Badge variant="success">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="info">Role-Specific</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="info">Role-Specific</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="info">Role-Specific</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="info">Patient Only</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Patients</TableCell>
                                            <TableCell>
                                                <Badge variant="success">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="success">View/Edit</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="success">View/Edit</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="success">View/Edit</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Laboratory</TableCell>
                                            <TableCell>
                                                <Badge variant="success">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="success">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Billing</TableCell>
                                            <TableCell>
                                                <Badge variant="success">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="success">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Appointments</TableCell>
                                            <TableCell>
                                                <Badge variant="success">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="success">Full Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">No Access</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="info">View Own</Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
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
