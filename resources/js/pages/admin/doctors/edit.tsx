import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

type Doctor = {
    id: number;
    name: string;
    email: string;
    specialization?: string;
    license_number?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

const breadcrumbs = (doctor: Doctor): BreadcrumbItem[] => [
    { title: 'Admin', href: '/admin' },
    { title: 'Doctor Management', href: '/admin/doctors' },
    { title: `Edit ${doctor.name}`, href: `/admin/doctors/${doctor.id}/edit` },
];

export default function DoctorEdit({ doctor }: { doctor: Doctor }) {
    const { data, setData, processing, errors, reset } = useForm({
        name: doctor.name,
        email: doctor.email,
        password: '',
        password_confirmation: '',
        specialization: doctor.specialization || '',
        license_number: doctor.license_number || '',
        is_active: doctor.is_active,
    });

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        router.put(`/admin/doctors/${doctor.id}`, data, {
            onSuccess: () => {
                router.visit('/admin/doctors');
            },
            onError: (errors) => {
                console.error('Doctor update failed:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(doctor)}>
            <Head title={`Edit Doctor - ${doctor.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/doctors')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Doctors
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Doctor</h1>
                            <p className="text-muted-foreground">Update doctor information</p>
                        </div>
                    </div>
                    <Button onClick={submit} disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Dr. John Smith"
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="e.g., john.smith@clinic.com"
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm new password"
                                        />
                                        {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Professional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="specialization">Specialization</Label>
                                        <Input
                                            id="specialization"
                                            value={data.specialization}
                                            onChange={(e) => setData('specialization', e.target.value)}
                                            placeholder="e.g., Internal Medicine, Cardiology"
                                        />
                                        {errors.specialization && <p className="text-sm text-red-500">{errors.specialization}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="license_number">License Number</Label>
                                        <Input
                                            id="license_number"
                                            value={data.license_number}
                                            onChange={(e) => setData('license_number', e.target.value)}
                                            placeholder="e.g., PRC-123456"
                                        />
                                        {errors.license_number && <p className="text-sm text-red-500">{errors.license_number}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <Label htmlFor="is_active">Doctor is active and can access the system</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Doctor Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <strong>Status:</strong> {doctor.is_active ? 'Active' : 'Inactive'}
                                </div>
                                <div>
                                    <strong>Created:</strong> {new Date(doctor.created_at).toLocaleDateString()}
                                </div>
                                <div>
                                    <strong>Last Updated:</strong> {new Date(doctor.updated_at).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
