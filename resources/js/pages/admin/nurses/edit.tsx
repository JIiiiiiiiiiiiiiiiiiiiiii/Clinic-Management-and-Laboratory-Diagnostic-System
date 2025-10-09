import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Save, Stethoscope, User, Mail, Lock, Shield, CheckCircle, ArrowLeft } from 'lucide-react';

type Nurse = {
    id: number;
    name: string;
    email: string;
    specialization?: string;
    license_number?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

const breadcrumbs = (nurse: Nurse): BreadcrumbItem[] => [
    {
        title: 'Nurse Management',
        href: '/admin/nurses',
    },
    {
        title: 'Edit Nurse',
        href: `/admin/nurses/${nurse.id}/edit`,
    },
];

export default function NurseEdit({ nurse }: { nurse: Nurse }) {
    const { data, setData, processing, errors, reset } = useForm({
        name: nurse.name,
        email: nurse.email,
        password: '',
        password_confirmation: '',
        specialization: nurse.specialization || '',
        license_number: nurse.license_number || '',
        is_active: nurse.is_active,
    });

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        router.put(`/admin/nurses/${nurse.id}`, data, {
            onSuccess: () => {
                router.visit('/admin/nurses');
            },
            onError: (errors) => {
                console.error('Nurse update failed:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(nurse)}>
            <Head title={`Edit Nurse - ${nurse.name}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Edit Nurse</h1>
                                <p className="text-sm text-black mt-1">Update nurse information - {nurse.name}</p>
                            </div>
                        </div>
                        <Link href="/admin/nurses">
                            <Button variant="outline" className="text-black border-gray-300 hover:bg-gray-50">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Nurses
                            </Button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gray-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Basic Information</h3>
                                    <p className="text-gray-100 mt-1">Nurse's personal and contact details</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gray-50">
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
                                        className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.name ? 'border-gray-500' : ''}`}
                                        placeholder="e.g., Jane Smith"
                                    />
                                    {errors.name && <p className="text-sm text-black">{errors.name}</p>}
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
                                        className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.email ? 'border-gray-500' : ''}`}
                                        placeholder="e.g., jane.smith@clinic.com"
                                    />
                                    {errors.email && <p className="text-sm text-black">{errors.email}</p>}
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
                                        className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.password ? 'border-gray-500' : ''}`}
                                        placeholder="Enter new password"
                                    />
                                    {errors.password && <p className="text-sm text-black">{errors.password}</p>}
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
                                        className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.password_confirmation ? 'border-gray-500' : ''}`}
                                        placeholder="Confirm new password"
                                    />
                                    {errors.password_confirmation && <p className="text-sm text-black">{errors.password_confirmation}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gray-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Professional Information</h3>
                                    <p className="text-gray-100 mt-1">Nursing credentials and specialization</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gray-50">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="specialization" className="text-sm font-semibold text-gray-700">Specialization</Label>
                                    <Input
                                        id="specialization"
                                        value={data.specialization}
                                        onChange={(e) => setData('specialization', e.target.value)}
                                        className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        placeholder="e.g., Critical Care, Pediatrics"
                                    />
                                    {errors.specialization && <p className="text-sm text-black">{errors.specialization}</p>}
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
                                        className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                        placeholder="e.g., PRC-123456"
                                    />
                                    {errors.license_number && <p className="text-sm text-black">{errors.license_number}</p>}
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-5 w-5 text-black focus:ring-gray-500 border-gray-300 rounded"
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Nurse is active and can access the system
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nurse Status Information */}
                    <div className="shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gray-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Nurse Status</h3>
                                    <p className="text-gray-100 mt-1">Account information and timestamps</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gray-50">
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-1">Status</div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={nurse.is_active ? 'default' : 'secondary'}>
                                                {nurse.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-1">Created</div>
                                        <div className="text-lg font-bold text-gray-600">{new Date(nurse.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-gray-200">
                                        <div className="text-sm font-semibold text-gray-700 mb-1">Last Updated</div>
                                        <div className="text-lg font-bold text-gray-600">{new Date(nurse.updated_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button asChild variant="secondary" className="px-8 py-4 text-lg font-semibold rounded-xl">
                            <Link href="/admin/nurses">Cancel</Link>
                        </Button>
                        <Button 
                            onClick={submit} 
                            disabled={processing}
                            className="bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
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
