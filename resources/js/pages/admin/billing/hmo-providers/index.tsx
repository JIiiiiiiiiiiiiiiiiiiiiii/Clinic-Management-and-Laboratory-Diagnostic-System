import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Building2,
    Phone,
    Mail,
    MapPin,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

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
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'HMO Providers', href: '/admin/billing/hmo-providers' },
];

export default function HmoProvidersIndex({ 
    hmoProviders = [],
    filters = {}
}: { 
    hmoProviders: HmoProvider[];
    filters: any;
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const filteredProviders = hmoProviders.filter(provider => 
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (providerId: number) => {
        if (confirm('Are you sure you want to delete this HMO provider? This action cannot be undone.')) {
            router.delete(`/admin/billing/hmo-providers/${providerId}`, {
                onSuccess: () => {
                    // Provider will be removed from the list
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete HMO provider. Please try again.');
                },
            });
        }
    };

    const toggleStatus = (providerId: number, currentStatus: boolean) => {
        router.put(`/admin/billing/hmo-providers/${providerId}/toggle-status`, {
            is_active: !currentStatus
        }, {
            onSuccess: () => {
                // Status will be updated
            },
            onError: (errors) => {
                console.error('Status update failed:', errors);
                alert('Failed to update provider status. Please try again.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HMO Providers" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading 
                                title="HMO Providers" 
                                description="Manage health maintenance organization providers"
                                icon={Building2} 
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button asChild>
                                <Link href="/admin/billing/hmo-providers/create">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Add Provider
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">HMO Providers</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Manage health insurance providers</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search providers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Providers Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">Provider</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Code</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Created</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProviders.length > 0 ? filteredProviders.map((provider) => (
                                        <TableRow key={provider.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Building2 className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{provider.name}</div>
                                                        {provider.description && (
                                                            <div className="text-sm text-gray-500">{provider.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">
                                                    {provider.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {provider.contact_number && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Phone className="h-3 w-3" />
                                                            {provider.contact_number}
                                                        </div>
                                                    )}
                                                    {provider.email && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Mail className="h-3 w-3" />
                                                            {provider.email}
                                                        </div>
                                                    )}
                                                    {provider.address && (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <MapPin className="h-3 w-3" />
                                                            {provider.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleStatus(provider.id, provider.is_active)}
                                                        className={provider.is_active ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
                                                    >
                                                        {provider.is_active ? (
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
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(provider.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/admin/billing/hmo-providers/${provider.id}/edit`}>
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(provider.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">No HMO providers found</h3>
                                                    <p className="text-gray-500 mb-4">Create your first HMO provider</p>
                                                    <Button asChild>
                                                        <Link href="/admin/billing/hmo-providers/create">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add Provider
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
