import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { 
    BarChart3, 
    FileText, 
    TrendingUp, 
    Download, 
    DollarSign, 
    Users, 
    Calendar 
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing Management',
        href: '/admin/billing',
    },
    {
        title: 'Reports',
        href: '/admin/billing/reports',
    },
];

type BillingSummary = {
    total_revenue?: number;
    total_doctor_payments?: number;
    net_profit?: number;
};

export default function BillingReports({ summary }: { summary: BillingSummary }) {
    const handleTransactionReport = () => {
        router.get('/admin/billing/reports/transactions');
    };

    const handleDoctorSummary = () => {
        router.get('/admin/billing/reports/doctor-summary');
    };

    const handleHMOReport = () => {
        router.get('/admin/billing/reports/hmo');
    };

    const handleExportAll = () => {
        router.get('/admin/billing/reports/export-all');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Reports" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing Reports</h1>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ₱{summary.total_revenue?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Doctor Payments</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ₱{summary.total_doctor_payments?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Net Profit</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ₱{summary.net_profit?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                                <TrendingUp className="h-5 w-5 text-black" />
                                Report Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex flex-col gap-2"
                                    onClick={handleTransactionReport}
                                >
                                    <Calendar className="h-6 w-6" />
                                    Transaction Report
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex flex-col gap-2"
                                    onClick={handleDoctorSummary}
                                >
                                    <Users className="h-6 w-6" />
                                    Doctor Summary
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex flex-col gap-2"
                                    onClick={handleHMOReport}
                                >
                                    <FileText className="h-6 w-6" />
                                    HMO Report
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="h-20 flex flex-col gap-2"
                                    onClick={handleExportAll}
                                >
                                    <Download className="h-6 w-6" />
                                    Export All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}