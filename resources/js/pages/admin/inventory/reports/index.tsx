import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Calendar, FileText, Package, TrendingDown, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Supply Management',
        href: '/admin/inventory',
    },
    {
        title: 'Reports',
        href: '/admin/inventory/reports',
    },
];

export default function ReportsIndex() {
    const reportCards = [
        {
            title: 'Used Supplies Report',
            description: 'Track consumed and used supplies with location and purpose details',
            icon: TrendingDown,
            href: '/admin/inventory/reports/used-supplies',
            color: 'text-red-500',
            iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
        },
        {
            title: 'Rejected Supplies Report',
            description: 'Monitor rejected, damaged, or expired supplies',
            icon: FileText,
            href: '/admin/inventory/reports/rejected-supplies',
            color: 'text-orange-500',
            iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
        },
        {
            title: 'In/Out Supplies Report',
            description: 'Complete transaction history for all supply movements',
            icon: BarChart3,
            href: '/admin/inventory/reports/in-out-supplies',
            color: 'text-blue-500',
            iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
            title: 'Stock Levels Report',
            description: 'Current inventory status with low stock and expiry alerts',
            icon: Package,
            href: '/admin/inventory/reports/stock-levels',
            color: 'text-green-500',
            iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        },
        {
            title: 'Daily Consumption Report',
            description: 'Daily usage patterns and consumption trends',
            icon: Calendar,
            href: '/admin/inventory/reports/daily-consumption',
            color: 'text-purple-500',
            iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
        },
        {
            title: 'Usage by Location Report',
            description: 'Supply consumption breakdown by department/location',
            icon: Users,
            href: '/admin/inventory/reports/usage-by-location',
            color: 'text-indigo-500',
            iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Reports" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Heading title="Inventory Reports" description="Generate comprehensive inventory analytics and reports" icon={BarChart3} />
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" onClick={() => router.visit('/admin/inventory')} className="bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Inventory
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {reportCards.map((report) => {
                        const IconComponent = report.icon;
                        return (
                            <div
                                key={report.href}
                                className="holographic-card shadow-md border-0 overflow-hidden rounded-xl bg-white hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                                onClick={() => router.visit(report.href)}
                            >
                                <div className="">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="page-title-icon p-3 rounded-xl border-2 border-white">
                                                <IconComponent className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 mt-auto">
                                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                        Generate Report
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-xl bg-white">
                    <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Report Categories</h3>
                                <p className="text-gray-100 mt-1">Organized by report type and functionality</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="holographic-card shadow-md border-0 overflow-hidden rounded-xl bg-white hover:shadow-lg transition-all duration-300 p-6 text-center">
                                        <div className="p-4 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl mb-4">
                                            <TrendingDown className="mx-auto h-12 w-12 text-white" />
                                        </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Consumption Reports</h3>
                                <p className="text-gray-600">Track how supplies are being used and consumed</p>
                            </div>
                            <div className="holographic-card shadow-md border-0 overflow-hidden rounded-xl bg-white hover:shadow-lg transition-all duration-300 p-6 text-center">
                                <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl mb-4">
                                    <BarChart3 className="mx-auto h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Transaction Reports</h3>
                                <p className="text-gray-600">Monitor all supply movements and transactions</p>
                            </div>
                            <div className="holographic-card shadow-md border-0 overflow-hidden rounded-xl bg-white hover:shadow-lg transition-all duration-300 p-6 text-center">
                                <div className="p-4 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl mb-4">
                                    <Package className="mx-auto h-12 w-12 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Stock Reports</h3>
                                <p className="text-gray-600">Current inventory levels and stock status</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
