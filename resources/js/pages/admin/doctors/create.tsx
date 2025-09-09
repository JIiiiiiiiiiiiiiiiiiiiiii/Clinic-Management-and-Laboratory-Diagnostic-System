import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Doctor Management', href: '/admin/doctors' },
    { title: 'Add Doctor', href: '/admin/doctors/create' },
];

export default function DoctorCreate() {
    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        specialization: '',
        license_number: '',
        is_active: true,
    });

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        router.post('/admin/doctors', data, {
            onSuccess: () => {
                router.visit('/admin/doctors');
            },
            onError: (errors) => {
                console.error('Doctor creation failed:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Doctor" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/doctors')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Add New Doctor</h1>
                            <p className="text-muted-foreground">Register a new doctor in the system</p>
                        </div>
                    </div>
                    <Button onClick={submit} disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Doctor
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
                                        <Label htmlFor="password">Password *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Minimum 8 characters"
                                        />
                                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm password"
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
                                <CardTitle>Quick Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <strong>Full Name:</strong> Use the doctor's complete name as it appears on their license
                                </div>
                                <div>
                                    <strong>Email:</strong> This will be used for login and notifications
                                </div>
                                <div>
                                    <strong>Specialization:</strong> Helps identify the doctor's area of expertise
                                </div>
                                <div>
                                    <strong>License Number:</strong> Professional license number for verification
                                </div>
                                <div>
                                    <strong>Active Status:</strong> Only active doctors can log in and access the system
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
