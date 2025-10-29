import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Calendar,
    CalendarDays,
    CalendarRange
} from 'lucide-react';
import { useState } from 'react';

type Doctor = {
    id: number;
    name: string;
    specialization: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Billing', href: '/admin/billing' },
    { title: 'Doctor Summary', href: '/admin/billing/doctor-summary' },
];

export default function DoctorSummary({ 
    doctors,
    filters
}: { 
    doctors: Doctor[];
    filters: any;
}) {
    const [selectedDate, setSelectedDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(filters.month || new Date().toISOString().slice(0, 7));
    const [selectedYear, setSelectedYear] = useState(filters.year || new Date().getFullYear().toString());
    const [activeTab, setActiveTab] = useState(filters.report_type || 'daily');
    const [doctorId, setDoctorId] = useState(filters.doctor_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleDailyReport = () => {
        const params: any = { date: selectedDate };
        if (doctorId !== 'all') {
            params.doctor_id = doctorId;
        }
        if (status !== 'all') {
            params.status = status;
        }
        router.get('/admin/billing/doctor-daily-report', params);
    };

    const handleMonthlyReport = () => {
        const params: any = { month: selectedMonth };
        if (doctorId !== 'all') {
            params.doctor_id = doctorId;
        }
        if (status !== 'all') {
            params.status = status;
        }
        router.get('/admin/billing/doctor-monthly-report', params);
    };

    const handleYearlyReport = () => {
        const params: any = { year: selectedYear };
        if (doctorId !== 'all') {
            params.doctor_id = doctorId;
        }
        if (status !== 'all') {
            params.status = status;
        }
        router.get('/admin/billing/doctor-yearly-report', params);
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Doctor Summary" />
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

                        {/* Additional Filters */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Doctor</Label>
                                    <Select value={doctorId} onValueChange={setDoctorId}>
                                        <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Doctors</SelectItem>
                                            {doctors.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                    {doctor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>



            </div>
        </AppLayout>
    );
}