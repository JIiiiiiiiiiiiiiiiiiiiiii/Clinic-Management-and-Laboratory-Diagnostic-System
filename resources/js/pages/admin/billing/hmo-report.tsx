import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    CreditCard,
    DollarSign,
    TrendingUp,
    Download,
    Filter
} from 'lucide-react';
import { useState } from 'react';

type HmoData = {
    hmo_provider: string;
    transaction_count: number;
    total_amount: number;
};

type Summary = {
    total_hmo_revenue: number;
    total_hmo_transactions: number;
    hmo_providers: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Reports', href: '/admin/billing/reports' },
    { title: 'HMO Report', href: '/admin/billing/hmo-report' },
];

export default function HmoReport({ 
    hmoData,
    summary,
    filters
}: { 
    hmoData: HmoData[];
    summary: Summary;
    filters: any;
}) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = () => {
        router.get('/admin/billing/hmo-report', {
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HMO Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing/reports">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading title="HMO Report" description="Health maintenance organization payment analysis" icon={CreditCard} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline">
                                <Download className="mr-2 h-5 w-5" />
                                Export Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <Filter className="h-5 w-5 text-black" />
                            Report Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Date From</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Date To</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                />
                            </div>
                            <Button onClick={handleFilter} className="h-12 px-6">
                                <Filter className="mr-2 h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">₱{summary.total_hmo_revenue.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Total HMO Revenue</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{summary.total_hmo_transactions}</div>
                                    <div className="text-sm text-gray-600">Total HMO Transactions</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{summary.hmo_providers}</div>
                                    <div className="text-sm text-gray-600">HMO Providers</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* HMO Data Table */}
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <CreditCard className="h-5 w-5 text-black" />
                            HMO Provider Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700">HMO Provider</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Transaction Count</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Total Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Average per Transaction</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Percentage of Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hmoData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="flex flex-col items-center">
                                                    <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                    <h3 className="mb-2 text-lg font-semibold text-gray-600">No HMO data found</h3>
                                                    <p className="text-gray-500">No HMO transactions for the selected period</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        hmoData.map((hmo, index) => {
                                            const averageAmount = hmo.transaction_count > 0 ? hmo.total_amount / hmo.transaction_count : 0;
                                            const percentage = summary.total_hmo_revenue > 0 ? (hmo.total_amount / summary.total_hmo_revenue) * 100 : 0;
                                            
                                            return (
                                                <TableRow key={index} className="hover:bg-gray-50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 bg-gray-100 rounded-full">
                                                                <CreditCard className="h-4 w-4 text-black" />
                                                            </div>
                                                            {hmo.hmo_provider}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {hmo.transaction_count}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-green-600">
                                                        ₱{hmo.total_amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        ₱{averageAmount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-blue-600 h-2 rounded-full" 
                                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* HMO Performance Chart Placeholder */}
                <Card className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <TrendingUp className="h-5 w-5 text-black" />
                            HMO Performance Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="text-center py-8">
                            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-600">HMO Performance Chart</h3>
                            <p className="text-gray-500">Visual representation of HMO provider performance will be implemented here</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}



