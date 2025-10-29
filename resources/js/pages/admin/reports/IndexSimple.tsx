import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  FileBarChart, 
  Users, 
  Calendar, 
  CreditCard, 
  Package,
  ArrowRightLeft,
  Activity,
  Download,
  TestTube,
  UserCheck,
  Clock,
  Calendar as CalendarIcon,
  TrendingUp
} from 'lucide-react';

interface Summary {
  total_patients: number;
  total_appointments: number;
  total_transactions: number;
  total_revenue: number;
}

interface ChartData {
  patientTrends: Record<string, number>;
  appointmentTrends: Record<string, number>;
  revenueTrends: Record<string, number>;
}

interface DateRange {
  start: string;
  end: string;
  period: string;
  label: string;
}

interface Props {
  user: any;
  summary: Summary;
  chartData: ChartData;
  recentActivities: any[];
  dateRange: DateRange;
  activeTab?: string;
}

export default function AdminReportsIndex({ user, summary, chartData, recentActivities, dateRange, activeTab = 'daily' }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Reports', href: route('admin.reports.index') },
  ];

  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    // Update URL with period parameter
    router.get(route('admin.reports.index'), { period: tab }, {
      preserveState: true,
      replace: true
    });
  };

  const handleExportAll = (period: string) => {
    window.location.href = `${route('admin.reports.export')}?type=all&period=${period}`;
  };

  const reportCategories = [
    {
      title: 'Laboratory',
      description: 'Track lab tests and results',
      icon: TestTube,
      href: route('admin.reports.laboratory')
    },
    {
      title: 'Inventory',
      description: 'Track supply usage and stock levels',
      icon: Package,
      href: route('admin.reports.inventory')
    },
    {
      title: 'Appointments',
      description: 'Track appointment trends and status',
      icon: Calendar,
      href: route('admin.reports.appointments')
    },
    {
      title: 'Specialist Management',
      description: 'Monitor specialist referrals and management',
      icon: UserCheck,
      href: route('admin.reports.specialist.management')
    },
    {
      title: 'Billing',
      description: 'Monitor billing and payment data',
      icon: CreditCard,
      href: route('admin.reports.billing')
    }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Reports" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
            <p className="text-gray-600">Comprehensive reports for all clinic operations</p>
          </div>
        </div>

        {/* Tabs for Daily, Monthly, Yearly */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily Reports
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Monthly Reports
            </TabsTrigger>
            <TabsTrigger value="yearly" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Yearly Reports
            </TabsTrigger>
          </TabsList>

          {/* Daily Reports Tab */}
          <TabsContent value="daily" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Daily Reports</h2>
                <p className="text-gray-600">Today's operational data and statistics</p>
              </div>
              <Button onClick={() => handleExportAll('daily')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Daily Reports
              </Button>
            </div>


            {/* Daily Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportCategories.map((report, index) => (
                <Link key={index} href={`${report.href}?period=daily`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                      <report.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs">
                        {report.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Monthly Reports Tab */}
          <TabsContent value="monthly" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Monthly Reports</h2>
                <p className="text-gray-600">This month's operational data and trends</p>
              </div>
              <Button onClick={() => handleExportAll('monthly')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Monthly Reports
              </Button>
            </div>


            {/* Monthly Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportCategories.map((report, index) => (
                <Link key={index} href={`${report.href}?period=monthly`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                      <report.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs">
                        {report.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Yearly Reports Tab */}
          <TabsContent value="yearly" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Yearly Reports</h2>
                <p className="text-gray-600">This year's operational data and annual trends</p>
              </div>
              <Button onClick={() => handleExportAll('yearly')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Yearly Reports
              </Button>
            </div>


            {/* Yearly Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportCategories.map((report, index) => (
                <Link key={index} href={`${report.href}?period=yearly`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                      <report.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs">
                        {report.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
