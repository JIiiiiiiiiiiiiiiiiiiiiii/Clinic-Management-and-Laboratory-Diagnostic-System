import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { BarChart3, FileDown, Filter, Search, Eye, Calendar, TestTube, Users, TrendingUp, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

type LabTest = { id: number; name: string; code: string };
type Patient = { id: number; first_name: string; last_name: string };
type OrderDetail = {
    order_id: number;
    patient_name: string;
    patient_id: number;
    tests_ordered: string;
    status: string;
    ordered_at: string;
    ordered_by: string;
};

type ReportData = {
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    completion_rate: number;
    test_summary: Record<string, number>;
    order_details: OrderDetail[];
    period: string;
    start_date: string;
    end_date: string;
};

type LaboratoryReportsIndexProps = {
    filter: string;
    date: string;
    data: ReportData;
    availableTests: LabTest[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laboratory Reports', href: '/laboratory-reports' },
];

export default function LaboratoryReportsIndex({ filter, date, data, availableTests }: LaboratoryReportsIndexProps) {
    const [currentFilter, setCurrentFilter] = useState(filter);
    const [currentDate, setCurrentDate] = useState(date);
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = (newFilter: string) => {
        setCurrentFilter(newFilter);
        setIsLoading(true);
        router.get('/admin/reports/laboratory', {
            filter: newFilter,
            date: currentDate
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDateChange = (newDate: string) => {
        setCurrentDate(newDate);
        setIsLoading(true);
        router.get('/admin/reports/laboratory', {
            filter: currentFilter,
            date: newDate
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleExport = (format: 'excel' | 'pdf') => {
        const params = new URLSearchParams({
            filter: currentFilter,
            date: currentDate
        });
        
        if (format === 'excel') {
            window.open(`/admin/reports/laboratory/export/excel?${params}`, '_blank');
        } else {
            window.open(`/admin/reports/laboratory/export/pdf?${params}`, '_blank');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'processing':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'ordered':
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ordered':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Reports" />
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Laboratory Reports" description="Comprehensive laboratory data analysis and reporting" icon={BarChart3} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-xl shadow-lg border px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <BarChart3 className="h-6 w-6 text-black" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">{data.total_orders}</div>
                                        <div className="text-gray-600 text-sm font-medium">Total Orders</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unified Reports Interface */}
                <PatientInfoCard
                    title="Laboratory Reports"
                    icon={<BarChart3 className="h-5 w-5 text-black" />}
                >
                    {/* Filter Controls */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2 w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Report Type</Label>
                                <select
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                    value={currentFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="daily">Daily Report</option>
                                    <option value="monthly">Monthly Report</option>
                                    <option value="yearly">Yearly Report</option>
                                </select>
                            </div>
                            
                            <div className="w-full">
                                <CustomDatePicker
                                    label={currentFilter === 'daily' ? 'Select Date' : currentFilter === 'monthly' ? 'Select Month' : 'Select Year'}
                                    value={currentDate ? new Date(currentDate) : undefined}
                                    onChange={(date) => handleDateChange(date ? date.toISOString().split('T')[0] : '')}
                                    placeholder={`Select ${currentFilter} date`}
                                    variant="responsive"
                                    className="w-full"
                                />
                            </div>

                            <div className="w-full">
                                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Period</Label>
                                <div className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm flex items-center">
                                    {data.period}
                                </div>
                            </div>

                            <div className="w-full flex items-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl w-full h-12"
                                            disabled={isLoading}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Report
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExport('excel')}>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            Excel Spreadsheet
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                            <FileDown className="mr-2 h-4 w-4" />
                                            PDF Report
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Summary Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Orders</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.total_orders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pending Orders</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.pending_orders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {data.total_orders > 0 ? ((data.pending_orders / data.total_orders) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completed Orders</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.completed_orders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {data.total_orders > 0 ? ((data.completed_orders / data.total_orders) * 100).toFixed(1) : 0}%
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Completion Rate</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.completion_rate}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Test Summary Table */}
                    {Object.keys(data.test_summary).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Summary</h3>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(data.test_summary).map(([testType, count]) => (
                                            <tr key={testType}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{testType}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{count}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {data.total_orders > 0 ? ((count / data.total_orders) * 100).toFixed(1) : 0}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Order Details Table */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{data.order_details.length} orders found</span>
                                </div>
                            </div>
                        </div>

                        {data.order_details.length === 0 ? (
                            <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-gray-400 mb-4">
                                    <BarChart3 className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">No orders found</p>
                                <p className="text-gray-500">No laboratory orders found for the selected period</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests Ordered</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered At</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.order_details.map((order) => (
                                            <tr key={order.order_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{order.order_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div className="font-medium">{order.patient_name}</div>
                                                        <div className="text-xs text-gray-500">ID: {order.patient_id}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="max-w-xs truncate" title={order.tests_ordered}>
                                                        {order.tests_ordered}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge className={`${getStatusColor(order.status)} border`}>
                                                        {getStatusIcon(order.status)}
                                                        <span className="ml-1">{order.status}</span>
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(order.ordered_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {order.ordered_by}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </PatientInfoCard>
            </div>
        </AppLayout>
    );
}
