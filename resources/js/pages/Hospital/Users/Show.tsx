import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Mail, Shield, User } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'User Management', href: route('hospital.users.index') },
    { title: 'User Details', href: '#' },
];

interface Props {
    user: any;
    userId: string;
}

export default function ShowHospitalUser({ user, userId }: Props) {
    // Mock user data - in real implementation, this would come from props
    const userData = {
        id: userId,
        name: 'Hospital Staff Member',
        email: 'staff@hospital.com',
        role: 'hospital_staff',
        is_active: true,
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-01-20T14:45:00Z',
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'hospital_admin':
                return 'bg-red-100 text-red-800';
            case 'hospital_staff':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Details - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                        <p className="text-muted-foreground">View and manage user information</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <a href={route('hospital.users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </a>
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.users.edit', userId)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* User Information */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>Basic Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="text-lg font-semibold">{userData.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                <p className="flex items-center space-x-2 text-lg">
                                    <Mail className="h-4 w-4" />
                                    <span>{userData.email}</span>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Role</label>
                                <div className="mt-1">
                                    <Badge className={getRoleBadgeColor(userData.role)}>
                                        <Shield className="mr-1 h-3 w-3" />
                                        {userData.role.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="mt-1">
                                    <Badge
                                        variant={userData.is_active ? 'default' : 'secondary'}
                                        className={userData.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                    >
                                        {userData.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5" />
                                <span>Account Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                                <p className="text-lg">
                                    {new Date(userData.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                                <p className="text-lg">
                                    {userData.last_login
                                        ? new Date(userData.last_login).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : 'Never'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                <p className="font-mono text-lg">{userData.id}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Permissions Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permissions & Access</CardTitle>
                        <CardDescription>Current permissions and access levels for this user</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h4 className="mb-2 font-medium">Hospital Access</h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li>• View hospital dashboard</li>
                                    <li>• Manage patients</li>
                                    <li>• View reports</li>
                                    <li>• Transfer patients to clinic</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-2 font-medium">Additional Permissions</h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {userData.role === 'hospital_admin' ? (
                                        <>
                                            <li>• Manage hospital users</li>
                                            <li>• Access all reports</li>
                                            <li>• System administration</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>• Basic patient management</li>
                                            <li>• View assigned reports</li>
                                            <li>• Limited system access</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
