import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Package,
  TrendingUp,
  Download,
  Filter,
  BarChart3,
  Activity,
  FileText
} from 'lucide-react';

interface SummaryStats {
  total_patients: number;
  total_appointments: number;
  total_transactions: number;
  total_revenue: number;
  completed_appointments: number;
  pending_appointments: number;
}

interface ChartData {
  patientTrends: Record<string, number>;
  appointmentTrends: Record<string, number>;
  revenueTrends: Record<string, number>;
}

interface RecentActivity {
  type: string;
  description: string;
  date: string;
  icon: string;
}

interface DateRange {
  start: string;
  end: string;
  period: string;
  label: string;
}

interface Props {
  user: any;
  summary: SummaryStats;
  chartData: ChartData;
  recentActivities: RecentActivity[];
  dateRange: DateRange;
}

export default function HospitalReportsIndex({ user, summary, chartData, recentActivities, dateRange }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState(dateRange.period);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Reports', href: route('hospital.reports.index') },
  ];

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    router.get(route('hospital.reports.index'), { period }, {
      preserveState: true,
      replace: true
    });
  };

  const handleCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      router.get(route('hospital.reports.index'), {
        start_date: customStartDate,
        end_date: customEndDate
      }, {
        preserveState: true,
        replace: true
      });
    }
  };

  const exportReport = (type: string) => {
    const params = new URLSearchParams({
      period: selectedPeriod,
      ...(customStartDate && customEndDate ? {
        start_date: customStartDate,
        end_date: customEndDate
      } : {})
    });
    
    window.open(route('hospital.reports.export', type) + '?' + params.toString());
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Hospital Reports Dashboard" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hospital Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive analytics and reporting for St. James Hospital
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {dateRange.label}
            </Badge>
          </div>
        </div>

        {/* Date Range Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Date Range Filters
            </CardTitle>
            <CardDescription>
              Filter reports by daily, monthly, yearly, or custom date ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="period">Quick Filters</Label>
                <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Today</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="yearly">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleCustomDateFilter} className="w-full">
                  Apply Custom Range
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_patients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Registered in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_appointments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {summary.completed_appointments} completed, {summary.pending_appointments} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_transactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Financial transactions processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{summary.total_revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Revenue generated in period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Report Types */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patient Reports</TabsTrigger>
            <TabsTrigger value="appointments">Appointment Reports</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Reports</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
          <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activities
                  </CardTitle>
                  <CardDescription>
                    Latest activities in the selected period
                  </CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Generate and export reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => exportReport('patients')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Patients
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => exportReport('appointments')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Appointments
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => exportReport('transactions')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Transactions
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => exportReport('inventory')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Inventory
                    </Button>
                  </div>
            </CardContent>
          </Card>
        </div>
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient Reports</CardTitle>
                <CardDescription>
                  Comprehensive patient analytics and data
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    View detailed patient reports with filtering and export capabilities
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href={route('hospital.reports.patients')}>
                        View Patient Reports
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('patients')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    </div>
                    </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Reports</CardTitle>
                <CardDescription>
                  Appointment scheduling and management analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    View appointment trends, scheduling patterns, and completion rates
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href={route('hospital.reports.appointments')}>
                        View Appointment Reports
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('appointments')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Reports</CardTitle>
                <CardDescription>
                  Financial transactions and revenue analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    View transaction history, payment methods, and revenue trends
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href={route('hospital.reports.transactions')}>
                        View Transaction Reports
                      </Link>
                      </Button>
                    <Button variant="outline" onClick={() => exportReport('transactions')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
        <Card>
          <CardHeader>
                <CardTitle>Inventory Reports</CardTitle>
            <CardDescription>
                  Supply and inventory management analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    View inventory levels, transaction history, and supply trends
                  </p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href={route('hospital.reports.inventory')}>
                        View Inventory Reports
                      </Link>
              </Button>
                    <Button variant="outline" onClick={() => exportReport('inventory')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
              </Button>
                  </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}