import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
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
        },
        {
            title: 'Rejected Supplies Report',
            description: 'Monitor rejected, damaged, or expired supplies',
            icon: FileText,
            href: '/admin/inventory/reports/rejected-supplies',
            color: 'text-orange-500',
        },
        {
            title: 'In/Out Supplies Report',
            description: 'Complete transaction history for all supply movements',
            icon: BarChart3,
            href: '/admin/inventory/reports/in-out-supplies',
            color: 'text-blue-500',
        },
        {
            title: 'Stock Levels Report',
            description: 'Current inventory status with low stock and expiry alerts',
            icon: Package,
            href: '/admin/inventory/reports/stock-levels',
            color: 'text-green-500',
        },
        {
            title: 'Daily Consumption Report',
            description: 'Daily usage patterns and consumption trends',
            icon: Calendar,
            href: '/admin/inventory/reports/daily-consumption',
            color: 'text-purple-500',
        },
        {
            title: 'Usage by Location Report',
            description: 'Supply consumption breakdown by department/location',
            icon: Users,
            href: '/admin/inventory/reports/usage-by-location',
            color: 'text-indigo-500',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Reports" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.visit('/admin/inventory')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Inventory Reports</h1>
                            <p className="text-muted-foreground">Generate comprehensive inventory analytics and reports</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reportCards.map((report) => {
                        const IconComponent = report.icon;
                        return (
                            <Card key={report.href} className="cursor-pointer transition-colors hover:bg-muted/50">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                                    <IconComponent className={`h-4 w-4 ${report.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-xs text-muted-foreground">{report.description}</p>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.visit(report.href)}>
                                        Generate Report
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Report Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border p-4 text-center">
                                <TrendingDown className="mx-auto mb-2 h-8 w-8 text-red-500" />
                                <h3 className="font-semibold">Consumption Reports</h3>
                                <p className="text-sm text-muted-foreground">Track how supplies are being used and consumed</p>
                            </div>
                            <div className="rounded-lg border p-4 text-center">
                                <BarChart3 className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                                <h3 className="font-semibold">Transaction Reports</h3>
                                <p className="text-sm text-muted-foreground">Monitor all supply movements and transactions</p>
                            </div>
                            <div className="rounded-lg border p-4 text-center">
                                <Package className="mx-auto mb-2 h-8 w-8 text-green-500" />
                                <h3 className="font-semibold">Stock Reports</h3>
                                <p className="text-sm text-muted-foreground">Current inventory levels and stock status</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
