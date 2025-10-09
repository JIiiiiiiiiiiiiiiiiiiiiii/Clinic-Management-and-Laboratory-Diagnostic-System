import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Save, Stethoscope, User, Mail, Lock, Shield, CheckCircle, UserCheck } from 'lucide-react';

type MedTech = {
    id: number;
    name: string;
    email: string;
    specialization?: string;
    license_number?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

const breadcrumbs = (medtech: MedTech): BreadcrumbItem[] => [
    {
        title: 'Specialist Management',
        href: '/admin/specialists',
    },
    {
        title: 'Med Techs',
        href: '/admin/specialists/medtechs',
    },
    {
        title: 'Edit Med Tech',
        href: `/admin/specialists/medtechs/${medtech.id}/edit`,
    },
];

export default function MedTechEdit({ medtech }: { medtech: MedTech }) {
    const { data, setData, processing, errors, reset } = useForm({
        name: medtech.name,
        email: medtech.email,
        password: '',
        password_confirmation: '',
        specialization: medtech.specialization || '',
        license_number: medtech.license_number || '',
        is_active: medtech.is_active,
    });

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        router.put(`/admin/specialists/medtechs/${medtech.id}`, data, {
            onSuccess: () => {
                router.visit('/admin/specialists/medtechs');
            },
            onError: (errors) => {
                console.error('Med tech update failed:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(medtech)}>
            <Head title={`Edit Med Tech - ${medtech.name}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Edit Med Tech</h1>
                                <p className="text-sm text-black mt-1">Update med tech information - {medtech.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <UserCheck className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">Edit</div>
                                        <div className="text-black text-sm font-medium">Med Tech Profile</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="max-w-4xl">
                    <Card className="shadow-lg border-0 rounded-xl bg-white">
                        <CardHeader className="bg-white border-b border-gray-200">
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-black">
                                <Stethoscope className="h-5 w-5 text-black" />
                                Med Tech Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-black font-medium">
                                            <User className="h-4 w-4 inline mr-2" />
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="border-gray-300 focus:border-black focus:ring-black"
                                            placeholder="Enter med tech's full name"
                                        />
                                        {errors.name && (
                                            <p className="text-black text-sm">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-black font-medium">
                                            <Mail className="h-4 w-4 inline mr-2" />
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="border-gray-300 focus:border-black focus:ring-black"
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && (
                                            <p className="text-black text-sm">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-black font-medium">
                                            <Lock className="h-4 w-4 inline mr-2" />
                                            New Password (leave blank to keep current)
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="border-gray-300 focus:border-black focus:ring-black"
                                            placeholder="Enter new password"
                                        />
                                        {errors.password && (
                                            <p className="text-black text-sm">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-black font-medium">
                                            <Shield className="h-4 w-4 inline mr-2" />
                                            Confirm New Password
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="border-gray-300 focus:border-black focus:ring-black"
                                            placeholder="Confirm new password"
                                        />
                                        {errors.password_confirmation && (
                                            <p className="text-black text-sm">{errors.password_confirmation}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="specialization" className="text-black font-medium">
                                            <Stethoscope className="h-4 w-4 inline mr-2" />
                                            Specialization
                                        </Label>
                                        <Input
                                            id="specialization"
                                            type="text"
                                            value={data.specialization}
                                            onChange={(e) => setData('specialization', e.target.value)}
                                            className="border-gray-300 focus:border-black focus:ring-black"
                                            placeholder="e.g., Clinical Chemistry, Hematology"
                                        />
                                        {errors.specialization && (
                                            <p className="text-black text-sm">{errors.specialization}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="license_number" className="text-black font-medium">
                                            <CheckCircle className="h-4 w-4 inline mr-2" />
                                            License Number
                                        </Label>
                                        <Input
                                            id="license_number"
                                            type="text"
                                            value={data.license_number}
                                            onChange={(e) => setData('license_number', e.target.value)}
                                            className="border-gray-300 focus:border-black focus:ring-black"
                                            placeholder="Enter license number"
                                        />
                                        {errors.license_number && (
                                            <p className="text-black text-sm">{errors.license_number}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label className="text-black font-medium">Status</Label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="is_active"
                                                checked={data.is_active === true}
                                                onChange={() => setData('is_active', true)}
                                                className="mr-2"
                                            />
                                            <span className="text-black">Active</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="is_active"
                                                checked={data.is_active === false}
                                                onChange={() => setData('is_active', false)}
                                                className="mr-2"
                                            />
                                            <span className="text-black">Inactive</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Med Tech Status Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-black mb-3">Account Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 bg-white rounded-lg border">
                                            <div className="text-sm font-medium text-gray-600 mb-1">Status</div>
                                            <Badge className={medtech.is_active ? 'bg-gray-100 text-black' : 'bg-gray-100 text-gray-800'}>
                                                {medtech.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border">
                                            <div className="text-sm font-medium text-gray-600 mb-1">Created</div>
                                            <div className="text-lg font-bold text-black">{new Date(medtech.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="p-3 bg-white rounded-lg border">
                                            <div className="text-sm font-medium text-gray-600 mb-1">Last Updated</div>
                                            <div className="text-lg font-bold text-black">{new Date(medtech.updated_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                    <Link href="/admin/specialists/medtechs">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="text-black border-gray-300 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-black hover:bg-gray-800 text-white px-6 py-2"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}