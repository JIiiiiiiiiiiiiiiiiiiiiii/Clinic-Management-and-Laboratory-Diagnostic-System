import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { 
    ArrowLeft, 
    TrendingUp,
    DollarSign,
    BarChart3,
    PieChart,
    Download,
    Calendar,
    Filter,
    FileText,
    Users,
    CreditCard,
    Clock,
    CalendarDays,
    CalendarRange
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Transaction Report', href: '/admin/billing/transaction-report' },
];

export default function TransactionReport() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [activeTab, setActiveTab] = useState('daily');

    const handleDailyReport = () => {
        router.get('/admin/billing/reports/daily', {
            date: selectedDate,
        });
    };

    const handleMonthlyReport = () => {
        router.get('/admin/billing/reports/monthly', {
            month: selectedMonth,
        });
    };

    const handleYearlyReport = () => {
        router.get('/admin/billing/reports/yearly', {
            year: selectedYear,
        });
    };

    const handleExport = (reportType: string, format: string) => {
        const params: any = { format };
        
        if (reportType === 'daily') {
            params.date = selectedDate;
        } else if (reportType === 'monthly') {
            params.month = selectedMonth;
        } else if (reportType === 'yearly') {
            params.year = selectedYear;
        }

        // Build the export URL with parameters
        const baseUrl = `/admin/billing/reports/${reportType}/export`;
        const queryString = new URLSearchParams(params).toString();
        const exportUrl = `${baseUrl}?${queryString}`;
        
        // Open the export URL in a new window/tab to trigger download
        window.open(exportUrl, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Report" />
            <div className="min-h-screen bg-white p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button asChild variant="outline" className="h-12 w-12">
                                <Link href="/admin/billing">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <Heading 
                                title="Transaction Report" 
                                description="Comprehensive financial reports for billing transactions" 
                                icon={BarChart3} 
                            />
                        </div>
                    </div>
                </div>

                {/* Report Type Tabs */}
                <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="daily" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Daily Report
                                </TabsTrigger>
                                <TabsTrigger value="monthly" className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    Monthly Report
                                </TabsTrigger>
                                <TabsTrigger value="yearly" className="flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4" />
                                    Yearly Report
                                </TabsTrigger>
                            </TabsList>

                            {/* Daily Report Tab */}
                            <TabsContent value="daily" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Date</Label>
                                            <Input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        <Button onClick={handleDailyReport} className="h-12 px-6">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Generate Daily Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('daily', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('daily', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('daily', 'word')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Word
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Monthly Report Tab */}
                            <TabsContent value="monthly" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Month</Label>
                                            <Input
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        <Button onClick={handleMonthlyReport} className="h-12 px-6">
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            Generate Monthly Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('monthly', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('monthly', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('monthly', 'word')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Word
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Yearly Report Tab */}
                            <TabsContent value="yearly" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Year</Label>
                                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 10 }, (_, i) => {
                                                        const year = new Date().getFullYear() - i;
                                                        return (
                                                            <SelectItem key={year} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleYearlyReport} className="h-12 px-6">
                                            <CalendarRange className="mr-2 h-4 w-4" />
                                            Generate Yearly Report
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('yearly', 'excel')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('yearly', 'pdf')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => handleExport('yearly', 'word')}
                                            className="h-12"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Word
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Report Information */}
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                            <FileText className="h-5 w-5 text-black" />
                            Report Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Daily Report</h3>
                                <p className="text-sm text-gray-600">
                                    View all transactions for a specific date including billing, payments, and expenses.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                                    <CalendarDays className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Monthly Report</h3>
                                <p className="text-sm text-gray-600">
                                    Comprehensive monthly financial summary with trends and analytics.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                                    <CalendarRange className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Yearly Report</h3>
                                <p className="text-sm text-gray-600">
                                    Annual financial overview with year-over-year comparisons and insights.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
