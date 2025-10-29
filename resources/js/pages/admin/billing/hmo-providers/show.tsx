import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    Building2,
    Edit,
    Phone,
    Mail,
    MapPin,
    CheckCircle,
    XCircle,
    Calendar,
    Clock
} from 'lucide-react';

type HmoProvider = {
    id: number;
    name: string;
    code: string;
    description?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    billing_transactions?: any[];
    claims?: any[];
};

interface ShowHmoProviderProps {
    hmoProvider: HmoProvider;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'HMO Providers', href: '/admin/billing/hmo-providers' },
    { title: 'Provider Details', href: '/admin/billing/hmo-providers/show' },
];

export default function ShowHmoProvider({ hmoProvider }: ShowHmoProviderProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`HMO Provider - ${hmoProvider.name}`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-6">
                        <Button asChild variant="outline" className="h-12 w-12">
                            <Link href="/admin/billing/hmo-providers">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Heading 
                            title={hmoProvider.name} 
                            description="HMO Provider Details"
                            icon={Building2} 
                        />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Provider Information Card */}
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                                    <Building2 className="h-5 w-5 text-black" />
                                    Provider Information
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge 
                                        variant={hmoProvider.is_active ? "default" : "secondary"}
                                        className={hmoProvider.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                    >
                                        {hmoProvider.is_active ? (
                                            <>
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="mr-1 h-3 w-3" />
                                                Inactive
                                            </>
                                        )}
                                    </Badge>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/billing/hmo-providers/${hmoProvider.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Provider Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{hmoProvider.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Provider Code</label>
                                        <Badge variant="outline" className="font-mono text-sm">
                                            {hmoProvider.code}
                                        </Badge>
                                    </div>
                                    {hmoProvider.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Description</label>
                                            <p className="text-gray-900">{hmoProvider.description}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {hmoProvider.contact_number && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Contact Number</label>
                                                <p className="text-gray-900">{hmoProvider.contact_number}</p>
                                            </div>
                                        </div>
                                    )}
                                    {hmoProvider.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Email Address</label>
                                                <p className="text-gray-900">{hmoProvider.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {hmoProvider.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Address</label>
                                                <p className="text-gray-900">{hmoProvider.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timestamps Card */}
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                <Clock className="h-5 w-5 text-black" />
                                Timestamps
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Created At</label>
                                        <p className="text-gray-900">
                                            {new Date(hmoProvider.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                        <p className="text-gray-900">
                                            {new Date(hmoProvider.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Billing Transactions Card */}
                    {hmoProvider.billing_transactions && hmoProvider.billing_transactions.length > 0 && (
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Billing Transactions ({hmoProvider.billing_transactions.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-sm text-gray-500">
                                    This provider has {hmoProvider.billing_transactions.length} associated billing transactions.
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Claims Card */}
                    {hmoProvider.claims && hmoProvider.claims.length > 0 && (
                        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Claims ({hmoProvider.claims.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-sm text-gray-500">
                                    This provider has {hmoProvider.claims.length} associated claims.
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href="/admin/billing/hmo-providers">
                                Back to Providers
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/admin/billing/hmo-providers/${hmoProvider.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Provider
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
