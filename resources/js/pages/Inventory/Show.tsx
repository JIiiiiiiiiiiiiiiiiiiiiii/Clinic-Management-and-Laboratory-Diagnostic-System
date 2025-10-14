import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    ArrowLeft,
    Edit,
    Trash2,
    AlertTriangle,
    TrendingDown,
    CheckCircle,
    Users,
    FlaskConical
} from 'lucide-react';

type InventoryItem = {
    id: number;
    item_name: string;
    item_code: string;
    category: string;
    unit: string;
    stock: number;
    consumed: number;
    rejected: number;
    status: string;
    low_stock_alert: number;
    description?: string;
    supplier?: string;
    location?: string;
    created_at: string;
    updated_at: string;
};

interface InventoryShowProps {
    item: InventoryItem;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory Management',
        href: '/admin/inventory',
    },
    {
        title: 'Item Details',
        href: '#',
    },
];

export default function InventoryShow({ item }: InventoryShowProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'low stock':
            case 'out of stock':
                return 'destructive';
            case 'in stock':
                return 'default';
            default:
                return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'low stock':
            case 'out of stock':
                return <AlertTriangle className="h-4 w-4" />;
            case 'in stock':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        if (category.toLowerCase().includes('doctor') || category.toLowerCase().includes('nurse')) {
            return <Users className="h-4 w-4" />;
        } else if (category.toLowerCase().includes('med') || category.toLowerCase().includes('tech')) {
            return <FlaskConical className="h-4 w-4" />;
        }
        return <Package className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${item.item_name} - Inventory Item`} />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">{item.item_name}</h1>
                                <p className="text-sm text-black mt-1">Inventory Item Details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => router.visit('/admin/inventory')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Inventory
                            </Button>
                            <Button asChild>
                                <Link href={`/admin/inventory/${item.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Item
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="w-full">
                    <PatientInfoCard
                        title="Item Information"
                        icon={<Package className="h-5 w-5 text-black" />}
                    >
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Item Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.item_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Item Code</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.item_code}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Category</label>
                                        <div className="flex items-center gap-2">
                                            {getCategoryIcon(item.category)}
                                            <span className="text-lg font-semibold text-gray-900">{item.category}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Unit</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.unit}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingDown className="h-5 w-5" />
                                        Stock Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Current Stock</label>
                                        <p className="text-2xl font-bold text-gray-900">{item.stock} {item.unit}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Consumed</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.consumed} {item.unit}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Rejected</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.rejected} {item.unit}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Low Stock Alert</label>
                                        <p className="text-lg font-semibold text-gray-900">{item.low_stock_alert} {item.unit}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Status and Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(item.status)}
                                        <Badge variant={getStatusColor(item.status) as any}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {item.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Description</label>
                                            <p className="text-gray-900">{item.description}</p>
                                        </div>
                                    )}
                                    {item.supplier && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Supplier</label>
                                            <p className="text-gray-900">{item.supplier}</p>
                                        </div>
                                    )}
                                    {item.location && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Location</label>
                                            <p className="text-gray-900">{item.location}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Timestamps */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Record Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Created At</label>
                                        <p className="text-gray-900">{new Date(item.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                        <p className="text-gray-900">{new Date(item.updated_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </PatientInfoCard>
                </div>
            </div>
        </AppLayout>
    );
}