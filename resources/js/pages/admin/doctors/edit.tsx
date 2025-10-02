import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Save, Stethoscope, User, Mail, Lock, Shield, CheckCircle } from 'lucide-react';

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
    {
        title: 'Doctor Management',
        href: '/admin/doctors',
    },
    {
        title: 'Edit Doctor',
        href: `/admin/doctors/${doctor.id}/edit`,
    },
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                            <Stethoscope className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-[#283890] mb-2">Edit Doctor</h1>
                            <p className="text-lg text-gray-600">Update doctor information - Dr. {doctor.name}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-8">

                    {/* Basic Information */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Basic Information</h3>
                                    <p className="text-blue-100 mt-1">Doctor's personal and contact details</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Full Name *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm ${errors.name ? 'border-red-500' : ''}`}
                                        placeholder="e.g., Dr. John Smith"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail className="h-5 w-5" />
                                        Email Address *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm ${errors.email ? 'border-red-500' : ''}`}
                                        placeholder="e.g., john.smith@clinic.com"
                                    />
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        New Password (leave blank to keep current)
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm ${errors.password ? 'border-red-500' : ''}`}
                                        placeholder="Enter new password"
                                    />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm ${errors.password_confirmation ? 'border-red-500' : ''}`}
                                        placeholder="Confirm new password"
                                    />
                                    {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Professional Information</h3>
                                    <p className="text-purple-100 mt-1">Medical credentials and specialization</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="specialization" className="text-sm font-semibold text-gray-700">Specialization</Label>
                                    <Input
                                        id="specialization"
                                        value={data.specialization}
                                        onChange={(e) => setData('specialization', e.target.value)}
                                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                                        placeholder="e.g., Internal Medicine, Cardiology"
                                    />
                                    {errors.specialization && <p className="text-sm text-red-500">{errors.specialization}</p>}
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="license_number" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        License Number
                                    </Label>
                                    <Input
                                        id="license_number"
                                        value={data.license_number}
                                        onChange={(e) => setData('license_number', e.target.value)}
                                        className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                                        placeholder="e.g., PRC-123456"
                                    />
                                    {errors.license_number && <p className="text-sm text-red-500">{errors.license_number}</p>}
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-purple-200">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Doctor is active and can access the system
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Status Information */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        {/* Header Section - No gaps */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Doctor Status</h3>
                                    <p className="text-green-100 mt-1">Account information and timestamps</p>
                                </div>
                            </div>
                        </div>
                        {/* Content Section - Seamlessly connected */}
                        <div className="px-6 py-6 bg-gradient-to-br from-green-50 to-green-100">
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="p-4 bg-white rounded-xl border border-green-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-1">Status</div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={doctor.is_active ? 'success' : 'destructive'}>
                                                {doctor.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-green-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-1">Created</div>
                                        <div className="text-lg font-bold text-gray-600">{new Date(doctor.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-green-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-1">Last Updated</div>
                                        <div className="text-lg font-bold text-gray-600">{new Date(doctor.updated_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button asChild variant="secondary" className="px-8 py-4 text-lg font-semibold rounded-xl">
                            <Link href="/admin/doctors">Cancel</Link>
                        </Button>
                        <Button 
                            onClick={submit} 
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
                        >
                            <Save className="mr-3 h-6 w-6" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
