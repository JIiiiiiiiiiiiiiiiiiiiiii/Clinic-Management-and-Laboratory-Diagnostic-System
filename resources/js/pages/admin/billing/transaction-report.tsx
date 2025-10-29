import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { 
    TrendingUp,
    DollarSign,
    BarChart3,
    PieChart,
    Calendar,
    Filter,
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
        router.get('/admin/billing/billing-reports/daily', {
            date: selectedDate,
        });
    };

    const handleMonthlyReport = () => {
        router.get('/admin/billing/billing-reports/monthly', {
            month: selectedMonth,
        });
    };

    const handleYearlyReport = () => {
        router.get('/admin/billing/billing-reports/yearly', {
            year: selectedYear,
        });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Report" />
            <div className="min-h-screen bg-white p-6">

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
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Date</Label>
                                            <Input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        <div className="flex-1 flex justify-center">
                                            <Button onClick={handleDailyReport} className="h-12 px-6">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Generate Daily Report
                                            </Button>
                                        </div>
                                        <div className="w-48"></div>
                                    </div>
                                    
                                </div>
                            </TabsContent>

                            {/* Monthly Report Tab */}
                            <TabsContent value="monthly" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Month</Label>
                                            <Input
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl"
                                            />
                                        </div>
                                        <div className="flex-1 flex justify-center">
                                            <Button onClick={handleMonthlyReport} className="h-12 px-6">
                                                <CalendarDays className="mr-2 h-4 w-4" />
                                                Generate Monthly Report
                                            </Button>
                                        </div>
                                        <div className="w-48"></div>
                                    </div>
                                    
                                </div>
                            </TabsContent>

                            {/* Yearly Report Tab */}
                            <TabsContent value="yearly" className="mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between gap-4">
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
                                        <div className="flex-1 flex justify-center">
                                            <Button onClick={handleYearlyReport} className="h-12 px-6">
                                                <CalendarRange className="mr-2 h-4 w-4" />
                                                Generate Yearly Report
                                            </Button>
                                        </div>
                                        <div className="w-48"></div>
                                    </div>
                                    
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
