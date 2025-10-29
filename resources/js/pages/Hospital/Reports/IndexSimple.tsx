import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Download
} from 'lucide-react';

interface Summary {
  total_patients: number;
  total_appointments: number;
  total_transactions: number;
  total_revenue: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  user: any;
  summary: Summary;
  chartData: any[];
  recentActivities: any[];
  dateRange: DateRange;
}

export default function HospitalReportsIndex({ user, summary, chartData, recentActivities, dateRange }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Reports', href: route('hospital.reports.index') },
  ];

  const reportCards = [
    {
      title: 'Patient Reports',
      description: 'View patient statistics and demographics',
      icon: Users,
      href: route('hospital.reports.patients'),
      color: 'text-blue-600'
    },
    {
      title: 'Appointment Reports',
      description: 'Track appointment trends and status',
      icon: Calendar,
      href: route('hospital.reports.appointments'),
      color: 'text-green-600'
    },
    {
      title: 'Transaction Reports',
      description: 'Monitor billing and payment data',
      icon: CreditCard,
      href: route('hospital.reports.billing'),
      color: 'text-purple-600'
    },
    {
      title: 'Inventory Reports',
      description: 'Track supply usage and stock levels',
      icon: Package,
      href: route('hospital.reports.inventory'),
      color: 'text-orange-600'
    },
    {
      title: 'Transfer Reports',
      description: 'Monitor patient transfers between clinics',
      icon: ArrowRightLeft,
      href: route('hospital.reports.transfers'),
      color: 'text-cyan-600'
    },
    {
      title: 'Clinic Operations',
      description: 'View operational metrics and KPIs',
      icon: Activity,
      href: route('hospital.reports.clinic.operations'),
      color: 'text-red-600'
    }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Hospital Reports" />
      
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hospital Reports</h1>
            <p className="text-muted-foreground">Comprehensive analytics and reporting dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_patients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_appointments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_transactions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{summary.total_revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((report, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <report.icon className={`h-5 w-5 ${report.color}`} />
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={report.href}>
                    View Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Date Range Info */}
        <Card>
          <CardHeader>
            <CardTitle>Report Period</CardTitle>
            <CardDescription>Current reporting period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              From {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
