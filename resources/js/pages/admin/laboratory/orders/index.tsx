import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, FileText, Plus, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

type Order = {
    id: number;
    status: 'ordered' | 'processing' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    notes?: string;
    patient: {
        id: number;
        first_name: string;
        last_name: string;
        age: number;
        sex: string;
    };
    labTests: Array<{
        id: number;
        name: string;
        code: string;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Lab Orders', href: '/admin/laboratory/orders' },
];

const statusConfig = {
    ordered: { label: 'Ordered', color: 'bg-blue-500', icon: Clock },
    processing: { label: 'Processing', color: 'bg-yellow-500', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

export default function LabOrdersIndex({ orders }: { orders: Order[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders.filter((order) => {
        const patientName = `${order.patient.first_name} ${order.patient.last_name}`.toLowerCase();
        const testNames = (order.labTests || [])
            .map((test) => test.name)
            .join(' ')
            .toLowerCase();
        const search = searchTerm.toLowerCase();

        return patientName.includes(search) || testNames.includes(search) || order.id.toString().includes(search);
    });

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <Badge variant="secondary" className={`${config.color} text-white`}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const handleEnterResults = (orderId: number) => {
        router.visit(`/admin/laboratory/orders/${orderId}/results`);
    };

    const handleUpdateStatus = (orderId: number, newStatus: string) => {
        router.put(
            `/admin/laboratory/orders/${orderId}/status`,
            { status: newStatus },
            {
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lab Orders" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/laboratory')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Laboratory
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Lab Orders</h1>
                            <p className="text-muted-foreground">Manage laboratory orders and results</p>
                        </div>
                    </div>
                    <Button onClick={() => router.visit('/admin/patient')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Order
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Lab Orders</CardTitle>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by patient name, test name, or order ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-80 pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredOrders.length === 0 ? (
                            <div className="py-8 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">{searchTerm ? 'No orders found' : 'No lab orders yet'}</h3>
                                <p className="text-muted-foreground">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Lab orders will appear here when created for patients'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                    <Card key={order.id} className="transition-shadow hover:shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                                                        {getStatusBadge(order.status)}
                                                    </div>

                                                    <div className="mb-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                                        <div>
                                                            <span className="text-sm text-muted-foreground">Patient:</span>
                                                            <div className="font-medium">
                                                                {order.patient.last_name}, {order.patient.first_name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {order.patient.age} years, {order.patient.sex}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <span className="text-sm text-muted-foreground">Tests Ordered:</span>
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {(order.labTests || []).map((test) => (
                                                                    <Badge key={test.id} variant="outline" className="text-xs">
                                                                        {test.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <span className="text-sm text-muted-foreground">Ordered:</span>
                                                            <div className="text-sm">{new Date(order.created_at).toLocaleString()}</div>
                                                        </div>
                                                    </div>

                                                    {order.notes && (
                                                        <div className="text-sm text-muted-foreground">
                                                            <strong>Notes:</strong> {order.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="ml-4 flex flex-col gap-2">
                                                    <Button onClick={() => handleEnterResults(order.id)} disabled={order.status === 'cancelled'}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Enter Results
                                                    </Button>

                                                    {order.status === 'ordered' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(order.id, 'processing')}
                                                        >
                                                            Start Processing
                                                        </Button>
                                                    )}

                                                    {order.status === 'processing' && (
                                                        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                                            Mark Complete
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
