import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Download, FileText, FlaskConical } from 'lucide-react';
import { useState } from 'react';

interface LabOrder {
    id: number;
    patient_name: string;
    doctor_name: string;
    test_name: string;
    status: string;
    created_at: string;
    result_date?: string;
}

interface Summary {
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    date_from?: string;
    date_to?: string;
}

interface LaboratoryReportsProps {
    labOrders: {
        data: LabOrder[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
}

const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Reports & Analytics', href: '/admin/reports' },
    { label: 'Laboratory Reports', href: '/admin/reports/laboratory' },
];

export default function LaboratoryReports({ labOrders, summary }: LaboratoryReportsProps) {
    const [dateFrom, setDateFrom] = useState(summary.date_from || '');
    const [dateTo, setDateTo] = useState(summary.date_to || '');
    const [status, setStatus] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        try {
            setIsExporting(true);
            const params = new URLSearchParams({
                format,
                date_from: dateFrom,
                date_to: dateTo,
                status: status,
            });
            window.location.href = `/admin/reports/export?type=laboratory&${params.toString()}`;

            setTimeout(() => {
                setIsExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs as any}>
            <Head title="Laboratory Reports" />
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-4 text-4xl font-semibold text-black">Laboratory Reports</h1>
                                <p className="mt-1 text-sm text-black">Lab test results and quality metrics</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleExport('excel')} disabled={isExporting} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Excel
                                </Button>
                                <Button onClick={() => handleExport('pdf')} disabled={isExporting} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <FlaskConical className="h-5 w-5 text-blue-600" />
                                    Total Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-blue-600">{summary.total_orders.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">All lab orders</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    Pending Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-yellow-600">{summary.pending_orders.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Awaiting results</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Completed Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-green-600">{summary.completed_orders.toLocaleString()}</div>
                                <p className="text-sm text-gray-600">Results available</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-0 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-200 bg-white">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    Completion Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-purple-600">
                                    {summary.total_orders > 0 ? Math.round((summary.completed_orders / summary.total_orders) * 100) : 0}%
                                </div>
                                <p className="text-sm text-gray-600">Success rate</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-8 rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <Calendar className="h-5 w-5 text-black" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <Label htmlFor="date_from">From Date</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date_to">To Date</Label>
                                    <Input id="date_to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button className="w-full">Apply Filters</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lab Orders Table */}
                    <Card className="rounded-xl border-0 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-200 bg-white">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-black">
                                <FileText className="h-5 w-5 text-black" />
                                Laboratory Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="hover:bg-gray-100">
                                            <TableHead className="font-semibold text-black">Order ID</TableHead>
                                            <TableHead className="font-semibold text-black">Patient</TableHead>
                                            <TableHead className="font-semibold text-black">Doctor</TableHead>
                                            <TableHead className="font-semibold text-black">Test Name</TableHead>
                                            <TableHead className="font-semibold text-black">Status</TableHead>
                                            <TableHead className="font-semibold text-black">Order Date</TableHead>
                                            <TableHead className="font-semibold text-black">Result Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {labOrders.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <FlaskConical className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                        <h3 className="mb-2 text-lg font-semibold text-black">No lab orders found</h3>
                                                        <p className="text-black">Try adjusting your filters or date range</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            labOrders.data.map((order) => (
                                                <TableRow key={order.id} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium text-black">#{order.id}</TableCell>
                                                    <TableCell className="text-black">{order.patient_name}</TableCell>
                                                    <TableCell className="text-black">{order.doctor_name}</TableCell>
                                                    <TableCell className="text-black">{order.test_name}</TableCell>
                                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                    <TableCell className="text-black">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-black">
                                                        {order.result_date ? new Date(order.result_date).toLocaleDateString() : 'N/A'}
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
            </div>
        </AppLayout>
    );
}
