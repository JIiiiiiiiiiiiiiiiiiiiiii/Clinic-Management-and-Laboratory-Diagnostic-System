import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Download, Eye, Stethoscope, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Laboratory Reports', href: route('hospital.reports.laboratory') },
];

interface LabOrder {
    id: number;
    patient_name: string;
    test_name: string;
    status: string;
    ordered_date: string;
    completed_date?: string;
    ordered_by?: string;
}

interface Props {
    labOrders: {
        data: LabOrder[];
        links: any[];
        meta: any;
    };
    stats: {
        total_orders: number;
        pending_orders: number;
        completed_orders: number;
        cancelled_orders: number;
    };
    dateRange: {
        start: string;
        end: string;
        period: string;
        label: string;
    };
    filters: any;
}

export default function HospitalLaboratoryReports({ labOrders, stats, dateRange, filters }: Props) {
    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Reports - Hospital" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laboratory Reports</h1>
                        <p className="text-muted-foreground">Laboratory orders and results analytics for {dateRange.label}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hospital.reports.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('hospital.reports.export', 'laboratory')}>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
                            <p className="text-xs text-muted-foreground">{dateRange.label}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats?.completed_orders || 0}</div>
                            <p className="text-xs text-muted-foreground">Tests completed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats?.pending_orders || 0}</div>
                            <p className="text-xs text-muted-foreground">Awaiting completion</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats?.cancelled_orders || 0}</div>
                            <p className="text-xs text-muted-foreground">Cancelled orders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Lab Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Laboratory Orders</CardTitle>
                        <CardDescription>Detailed laboratory orders for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {labOrders.data && labOrders.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Test Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ordered By</TableHead>
                                        <TableHead>Ordered Date</TableHead>
                                        <TableHead>Completed Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {labOrders.data.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.patient_name}</TableCell>
                                            <TableCell>{order.test_name}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeColor(order.status)}>{order.status.toUpperCase()}</Badge>
                                            </TableCell>
                                            <TableCell>{order.ordered_by || 'N/A'}</TableCell>
                                            <TableCell>{new Date(order.ordered_date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {order.completed_date ? new Date(order.completed_date).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('hospital.patients.show', order.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No lab orders found</h3>
                                <p className="mt-1 text-sm text-gray-500">No laboratory orders found for the selected period.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
