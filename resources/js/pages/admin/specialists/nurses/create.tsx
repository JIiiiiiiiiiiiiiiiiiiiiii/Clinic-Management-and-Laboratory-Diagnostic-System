import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Save, Stethoscope, User, Mail, Lock, Shield, CheckCircle, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Specialist Management',
        href: '/admin/specialists',
    },
    {
        title: 'Nurses',
        href: '/admin/specialists/nurses',
    },
    {
        title: 'Create Nurse',
        href: '/admin/specialists/nurses/create',
    },
];

export default function NurseCreate() {
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
        router.post('/admin/specialists/nurses', data, {
            onSuccess: () => {
                router.visit('/admin/specialists/nurses');
            },
            onError: (errors) => {
                console.error('Nurse creation failed:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Nurse" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Create Nurse</h1>
                                <p className="text-sm text-black mt-1">Add a new nurse to the clinic</p>
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
                                Nurse Information
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
                                            placeholder="Enter nurse's full name"
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
                                            Password *
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="border-gray-300 focus:border-black focus:ring-black"
                                            placeholder="Enter password"
                                        />
                                        {errors.password && (
                                            <p className="text-black text-sm">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-black font-medium">
                                            <Shield className="h-4 w-4 inline mr-2" />
                                            Confirm Password *
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="border-gray-300 focus:border-black focus:ring-black"
                                            placeholder="Confirm password"
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
                                            placeholder="e.g., Critical Care, Pediatrics"
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

                                {/* Submit Button */}
                                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                    <Link href="/admin/specialists/nurses">
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
                                        {processing ? 'Creating...' : 'Create Nurse'}
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
