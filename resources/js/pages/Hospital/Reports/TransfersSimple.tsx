import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowRightLeft, Download, ArrowLeft } from 'lucide-react';

interface Transfer {
  id: number;
  patient_name: string;
  from_clinic: string;
  to_clinic: string;
  transfer_date: string;
  status: string;
  reason: string;
}

interface TransferStats {
  total_transfers: number;
  completed_transfers: number;
  pending_transfers: number;
  cancelled_transfers: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  user: any;
  transfers: {
    data: Transfer[];
    links: any[];
    meta: any;
  };
  stats: TransferStats;
  dateRange: DateRange;
  filters: any;
}

export default function HospitalReportsTransfers({ user, transfers, stats, dateRange, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Reports', href: route('hospital.reports.index') },
    { label: 'Transfer Reports', href: route('hospital.reports.transfers') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Transfer Reports" />
      
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('hospital.reports.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transfer Reports</h1>
              <p className="text-muted-foreground">Patient transfer statistics between clinics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_transfers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed_transfers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_transfers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled_transfers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Transfers List */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Records</CardTitle>
            <CardDescription>Patient transfer data for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {transfers.data.length === 0 ? (
              <div className="text-center py-8">
                <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No transfer data found</h3>
                <p className="text-muted-foreground">No patient transfers match the current filters or date range.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transfers.data.map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <ArrowRightLeft className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{transfer.patient_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {transfer.from_clinic} → {transfer.to_clinic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{new Date(transfer.transfer_date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground capitalize">{transfer.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
