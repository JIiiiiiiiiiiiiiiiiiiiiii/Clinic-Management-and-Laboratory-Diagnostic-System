import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { BarChart3, FileDown, Filter, Search, Eye } from 'lucide-react';
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
    { title: 'Laboratory', href: '/admin/laboratory' },
    { title: 'Reports', href: '/admin/laboratory/reports' },
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laboratory Reports" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Heading title="Laboratory Reports" description="Filter and export laboratory data" icon={BarChart3} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="counter-card text-white rounded-xl shadow-lg border-0 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="counter-icon p-2 rounded-lg border border-white/60">
                                        <BarChart3 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">{orders.length}</div>
                                        <div className="text-blue-100 text-sm font-medium">Total Orders</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Card */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-lg bg-white">
                    {/* Header Section - No gaps */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                <Filter className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Filters</h3>
                                <p className="text-blue-100 mt-1">Search and filter laboratory orders for reporting</p>
                            </div>
                        </div>
                    </div>
                    {/* Content Section - Seamlessly connected */}
                    <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                        <div className="grid gap-6 md:grid-cols-4">
                        <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Search</Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                                    placeholder="Order # or patient name"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Test</Label>
                            <select
                                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                value={testId}
                                onChange={(e) => setTestId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            >
                                <option value="all">All</option>
                                {(tests || []).map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">From</Label>
                            <Input 
                                type="date" 
                                value={dateFrom} 
                                onChange={(e) => setDateFrom(e.target.value)} 
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">To</Label>
                            <Input 
                                type="date" 
                                value={dateTo} 
                                onChange={(e) => setDateTo(e.target.value)} 
                                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm"
                            />
                        </div>
                        </div>
                    </div>
                </div>

                {/* Results Card */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                    {/* Header Section - No gaps */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Results</h3>
                                <p className="text-blue-100 mt-1">View and export filtered laboratory data</p>
                            </div>
                        </div>
                    </div>
                    {/* Content Section - Seamlessly connected */}
                    <div className="px-6 py-6 bg-gradient-to-br from-green-50 to-green-100">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-semibold text-gray-700">Filtered Results</h4>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-sm hover:shadow-md transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-lg">
                                        <FileDown className="mr-2 h-4 w-4" /> Export Orders
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleExportOrders('excel')}>Excel</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExportOrders('pdf')}>PDF</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExportOrders('word')}>Word</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {filtered.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground">No data for selected filters</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                                            <th className="px-3 py-2">Order #</th>
                                            <th className="px-3 py-2">Patient</th>
                                            <th className="px-3 py-2">Date</th>
                                            <th className="px-3 py-2">Tests</th>
                                            <th className="px-3 py-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((o) => (
                                            <tr key={o.id} className="border-b last:border-0">
                                                <td className="px-3 py-2 font-medium">#{o.id}</td>
                                                <td className="px-3 py-2">{o.patient ? `${o.patient.last_name}, ${o.patient.first_name}` : '—'}</td>
                                                <td className="px-3 py-2">{new Date(o.created_at).toLocaleString()}</td>
                                                <td className="px-3 py-2">{(o.lab_tests || []).map((t) => t.name).join(', ')}</td>
                                                <td className="px-3 py-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.visit(`/admin/laboratory/orders/${o.id}/results/view`)}
                                                        className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-sm hover:shadow-md transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-lg"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
