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
import { BarChart3, FileDown, Filter, Search, Eye, Calendar, TestTube, Users, TrendingUp, Download } from 'lucide-react';
import { useMemo, useState } from 'react';

type LabTest = { id: number; name: string; code: string };
type Patient = { id: number; first_name: string; last_name: string };
type OrderLite = {
    id: number;
    created_at: string;
    patient: Patient | null;
    lab_tests: LabTest[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laboratory Reports', href: '/admin/laboratory/reports' },
];

export default function LaboratoryReportsIndex({ orders = [], tests = [] }: { orders?: OrderLite[]; tests?: LabTest[] }) {
    const [search, setSearch] = useState('');
    const [testId, setTestId] = useState<number | 'all'>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (orders || []).filter((o) => {
            const name = `${o.patient?.last_name ?? ''}, ${o.patient?.first_name ?? ''}`.toLowerCase();
            const matchesName = !q || name.includes(q) || `${o.id}`.includes(q);
            const matchesTest = testId === 'all' || (o.lab_tests || []).some((t) => t.id === testId);
            const created = new Date(o.created_at).getTime();
            const fromOk = !dateFrom || created >= new Date(dateFrom + 'T00:00:00').getTime();
            const toOk = !dateTo || created <= new Date(dateTo + 'T23:59:59').getTime();
            return matchesName && matchesTest && fromOk && toOk;
        });
    }, [orders, search, testId, dateFrom, dateTo]);

    const handleExportOrders = (format: 'excel' | 'pdf' | 'word') => {
        const path = '/admin/laboratory/exports/orders.xlsx';
        const separator = path.includes('?') ? '&' : '?';
        const url = `${path}${separator}format=${format}`;
        window.open(url, '_self');
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
                                        <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
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
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-black border-gray-200">
                                {filtered.length} of {orders.length} orders
                            </Badge>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-xl">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Data
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExportOrders('excel')}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Excel Spreadsheet
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportOrders('pdf')}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    PDF Report
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportOrders('word')}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Word Document
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                        {/* Filters Section */}
                        <div className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2 w-full">
                                    <Label className="text-sm font-semibold text-gray-800 mb-2 block">Search Orders</Label>
                                    <div className="relative w-full">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            className="pl-10 h-12 w-full border-gray-200 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                            placeholder="Order # or patient name"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 w-full">
                                    <Label className="text-sm font-semibold text-gray-800 mb-2 block">Test Type</Label>
                                    <select
                                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                        value={testId}
                                        onChange={(e) => setTestId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    >
                                        <option value="all">All Tests</option>
                                        {(tests || []).map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full">
                                    <CustomDatePicker
                                        label="From Date"
                                        value={dateFrom ? new Date(dateFrom) : undefined}
                                        onChange={(date) => setDateFrom(date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Select start date"
                                        variant="responsive"
                                        className="w-full"
                                    />
                                </div>
                                <div className="w-full">
                                    <CustomDatePicker
                                        label="To Date"
                                        value={dateTo ? new Date(dateTo) : undefined}
                                        onChange={(date) => setDateTo(date ? date.toISOString().split('T')[0] : '')}
                                        placeholder="Select end date"
                                        variant="responsive"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator className="my-8" />

                        {/* Results Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Filtered Results</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="h-4 w-4" />
                                        <span>{filtered.length} orders found</span>
                                    </div>
                                </div>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <div className="text-gray-400 mb-4">
                                        <BarChart3 className="h-12 w-12 mx-auto" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700 mb-2">No orders found</p>
                                    <p className="text-gray-500">Try adjusting your search criteria or date range</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filtered.map((order) => (
                                        <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                            <div className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-gray-100 rounded-lg">
                                                            <TestTube className="h-6 w-6 text-black" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-900">Order #{order.id}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {order.patient ? `${order.patient.last_name}, ${order.patient.first_name}` : 'No Patient'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-500">Created</p>
                                                            <p className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</p>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => router.visit(`/admin/laboratory/orders/${order.id}`)}
                                                            className="hover:bg-gray-50 hover:text-black transition-colors duration-200"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <TestTube className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm font-medium text-gray-700">Tests:</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(order.lab_tests || []).map((test, index) => (
                                                                <Badge key={index} variant="secondary" className="text-xs">
                                                                    {test.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PatientInfoCard>
            </div>
        </AppLayout>
    );
}
