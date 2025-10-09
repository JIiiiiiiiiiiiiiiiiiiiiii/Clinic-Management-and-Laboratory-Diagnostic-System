import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Download,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface AnalyticsData {
  patients: {
    total: number;
    new_this_month: number;
    new_today: number;
    growth_rate: number;
  };
  appointments: {
    total: number;
    today: number;
    this_month: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  financial: {
    total_revenue: number;
    monthly_revenue: number;
    today_revenue: number;
    average_transaction: number;
    payment_methods: Record<string, { count: number; total: number }>;
  };
  laboratory: {
    total_orders: number;
    pending_results: number;
    completed_results: number;
    this_month_orders: number;
    procedure_breakdown: Array<{ test_name: string; count: number }>;
  };
  transfers: {
    total_transfers: number;
    pending_transfers: number;
    completed_transfers: number;
    this_month_transfers: number;
  };
  staff: {
    total_staff: number;
    doctors: number;
    lab_staff: number;
    cashiers: number;
    admins: number;
  };
}

interface AnalyticsIndexProps {
  analytics: AnalyticsData;
}

export default function AnalyticsIndex({ analytics }: AnalyticsIndexProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <>
      <Head title="Analytics Dashboard" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into clinic operations and performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.patients.total.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {getGrowthIcon(analytics.patients.growth_rate)}
                <span className={getGrowthColor(analytics.patients.growth_rate)}>
                  {analytics.patients.growth_rate > 0 ? '+' : ''}{analytics.patients.growth_rate}%
                </span>
                <span>from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.patients.new_this_month} new this month
              </p>
            </CardContent>
          </Card>

          {/* Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.appointments.today}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.appointments.pending} pending, {analytics.appointments.confirmed} confirmed
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.appointments.this_month} this month
              </p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.financial.monthly_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.financial.today_revenue)} today
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {formatCurrency(analytics.financial.average_transaction)}
              </p>
            </CardContent>
          </Card>

          {/* Laboratory */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lab Orders</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.laboratory.total_orders}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.laboratory.pending_results} pending results
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.laboratory.this_month_orders} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Appointment Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Appointment Status</span>
              </CardTitle>
              <CardDescription>
                Current appointment distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">{analytics.appointments.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Confirmed</span>
                  </div>
                  <span className="font-medium">{analytics.appointments.confirmed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-medium">{analytics.appointments.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <span className="font-medium">{analytics.appointments.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Staff Distribution</span>
              </CardTitle>
              <CardDescription>
                Current staff by role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Doctors</span>
                  <Badge variant="outline">{analytics.staff.doctors}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lab Staff</span>
                  <Badge variant="outline">{analytics.staff.lab_staff}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cashiers</span>
                  <Badge variant="outline">{analytics.staff.cashiers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Administrators</span>
                  <Badge variant="outline">{analytics.staff.admins}</Badge>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Staff</span>
                    <span>{analytics.staff.total_staff}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Analytics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpRight className="h-5 w-5" />
                <span>Patient Transfers</span>
              </CardTitle>
              <CardDescription>
                Hospital to clinic transfer statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Transfers</span>
                  <span className="font-medium">{analytics.transfers.total_transfers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{analytics.transfers.pending_transfers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <Badge className="bg-green-100 text-green-800">{analytics.transfers.completed_transfers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">This Month</span>
                  <span className="font-medium">{analytics.transfers.this_month_transfers}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5" />
                <span>Top Procedures</span>
              </CardTitle>
              <CardDescription>
                Most requested laboratory procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.laboratory.procedure_breakdown.slice(0, 5).map((procedure, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate">{procedure.test_name}</span>
                    <Badge variant="outline">{procedure.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Detailed Reports</span>
            </CardTitle>
            <CardDescription>
              Access comprehensive reports for different aspects of clinic operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href={route('admin.analytics.patients')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Users className="h-6 w-6" />
                  <span>Patient Report</span>
                </Button>
              </Link>
              <Link href={route('admin.analytics.specialists')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Activity className="h-6 w-6" />
                  <span>Specialist Report</span>
                </Button>
              </Link>
              <Link href={route('admin.analytics.procedures')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Procedure Report</span>
                </Button>
              </Link>
              <Link href={route('admin.analytics.financial')}>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <DollarSign className="h-6 w-6" />
                  <span>Financial Report</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
