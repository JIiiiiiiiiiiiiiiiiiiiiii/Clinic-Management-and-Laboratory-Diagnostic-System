import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Download, Eye, FileText, Plus, Search, XCircle, FlaskConical } from 'lucide-react';
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
    } | null;
    lab_tests: Array<{
        id: number;
        name: string;
        code: string;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Lab Orders',
        href: '/admin/laboratory/orders',
    },
];

const statusConfig = {
    ordered: { label: 'Ordered', color: 'bg-gray-500', icon: Clock },
    processing: { label: 'Processing', color: 'bg-gray-500', icon: AlertCircle },
    completed: { label: 'Completed', color: 'bg-gray-500', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: XCircle },
};

export default function LabOrdersIndex({ orders }: { orders: Order[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders.filter((order) => {
        const patientName = `${order.patient?.first_name ?? ''} ${order.patient?.last_name ?? ''}`.trim().toLowerCase();
        const testNames = (order.lab_tests || [])
            .map((test) => test.name)
            .join(' ')
            .toLowerCase();
        const search = searchTerm.toLowerCase();

        return patientName.includes(search) || testNames.includes(search) || order.id.toString().includes(search);
    });

    const getStatusBadge = (status: keyof typeof statusConfig) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        
        // Map status to appropriate badge variant
        const variantMap = {
            ordered: 'info',
            processing: 'warning', 
            completed: 'success',
            cancelled: 'destructive'
        };
        
        return (
            <Badge variant={variantMap[status] as any}>
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
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Lab Orders" description="Manage laboratory orders and results" icon={FileText} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4 w-52 h-20 flex items-center overflow-hidden">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <FileText className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900 whitespace-nowrap leading-tight">{orders.length}</div>
                                        <div className="text-gray-600 text-sm font-medium whitespace-nowrap">Total Orders</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <Card className="shadow-lg mb-8">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FileText className="h-6 w-6 text-black" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">Lab Orders</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">Search and manage laboratory orders</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild>
                                            <Link href="/admin/laboratory/orders/create">
                                                <Plus className="mr-2 h-5 w-5" />
                                                New Order
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Create New Order</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-5 w-5" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => window.open('/admin/laboratory/exports/orders.xlsx?format=excel', '_self')}>
                                        Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open('/admin/laboratory/exports/orders.xlsx?format=pdf', '_self')}>
                                        PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open('/admin/laboratory/exports/orders.xlsx?format=word', '_self')}>
                                        Word
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by patient name, test name, or order ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Order #
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-700">Patient</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Tests Ordered</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Ordered</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">{searchTerm ? 'No orders found' : 'No lab orders yet'}</h3>
                                                    <p className="text-gray-500">
                                                        {searchTerm ? 'Try adjusting your search terms' : 'Lab orders will appear here when created for patients'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <TableRow key={order.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-gray-100 rounded-full">
                                                            <FileText className="h-4 w-4 text-black" />
                                                        </div>
                                                        #{order.id}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {order.patient ? (
                                                                `${order.patient.last_name}, ${order.patient.first_name}`
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.patient
                                                                ? `${order.patient.age} years, ${order.patient.sex}`
                                                                : 'Unknown patient'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(order.lab_tests || []).map((test) => (
                                                            <Badge key={test.id} variant="outline" className="text-xs">
                                                                {test.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(order.status)}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button asChild>
                                                            <Link href={`/admin/laboratory/orders/${order.id}`}>
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                View Order
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleEnterResults(order.id)}
                                                            disabled={order.status === 'cancelled'}
                                                        >
                                                            <FileText className="mr-1 h-4 w-4" />
                                                            Results
                                                        </Button>
                                                        {order.status === 'ordered' && (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleUpdateStatus(order.id, 'processing')}
                                                            >
                                                                Start
                                                            </Button>
                                                        )}
                                                        {order.status === 'processing' && (
                                                            <Button 
                                                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                            >
                                                                Complete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
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
