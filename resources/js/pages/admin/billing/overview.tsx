import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    CreditCard, 
    Receipt, 
    Clock, 
    DollarSign, 
    Users, 
    TrendingUp,
    Plus,
    FileText,
    BarChart3,
    Calendar
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Billing Management',
        href: '/admin/billing',
    },
];

export default function BillingOverview({ 
    summary 
}: { 
    summary: {
        totalTransactions: number;
        paidTransactions: number;
        pendingTransactions: number;
        totalRevenue: number;
        pendingAppointments: number;
        doctorPayments: number;
    }
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Management Overview" />
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-semibold text-black mb-2">Billing Management</h1>
                        <p className="text-sm text-gray-600">
                            Manage patient payments, billing records, and financial transactions
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.totalTransactions}</p>
                                        <p className="text-sm text-gray-500">All billing records</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Receipt className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Paid Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.paidTransactions}</p>
                                        <p className="text-sm text-gray-500">Successfully completed</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <CreditCard className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Transactions</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.pendingTransactions}</p>
                                        <p className="text-sm text-gray-500">Awaiting payment</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-3xl font-bold text-gray-900">₱{summary.totalRevenue.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">From paid transactions</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Appointments</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.pendingAppointments}</p>
                                        <p className="text-sm text-gray-500">Awaiting billing</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <Calendar className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Doctor Payments</p>
                                        <p className="text-3xl font-bold text-gray-900">{summary.doctorPayments}</p>
                                        <p className="text-sm text-gray-500">Payment records</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                            <Link href="/admin/billing/transactions">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Receipt className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Transactions</h3>
                                            <p className="text-sm text-gray-500">Manage billing records</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                            <Link href="/admin/billing/pending-appointments">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-yellow-100 rounded-lg">
                                            <Clock className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Pending Appointments</h3>
                                            <p className="text-sm text-gray-500">Awaiting billing</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                            <Link href="/admin/billing/doctor-payments">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <Users className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Doctor Payments</h3>
                                            <p className="text-sm text-gray-500">Manage doctor fees</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>

                        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                            <Link href="/admin/billing/reports">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-100 rounded-lg">
                                            <BarChart3 className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Reports</h3>
                                            <p className="text-sm text-gray-500">Financial analytics</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    </div>

                    {/* Quick Create */}
                    <Card className="bg-white border border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-green-600" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                                    <Link href="/admin/billing/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Transaction
                                    </Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/admin/billing/create-from-appointments">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Create from Appointments
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
