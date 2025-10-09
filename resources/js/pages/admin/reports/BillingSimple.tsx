import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CreditCard, Download, ArrowLeft } from 'lucide-react';

interface Transaction {
  id: number;
  patient_name: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  description: string;
}

interface BillingStats {
  total_transactions: number;
  total_revenue: number;
  pending_payments: number;
  completed_payments: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  user: any;
  transactions: {
    data: Transaction[];
    links: any[];
    meta: any;
  };
  stats: BillingStats;
  dateRange: DateRange;
  filters: any;
}

export default function AdminReportsBilling({ user, transactions, stats, dateRange, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Reports', href: route('admin.reports.index') },
    { title: 'Billing Reports', href: route('admin.reports.billing') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Billing Reports" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing Reports</h1>
            <p className="text-gray-600">Monitor billing and payment data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('admin.reports.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_transactions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{stats.total_revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_payments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completed_payments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Report Period: {dateRange.start} to {dateRange.end}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Transactions</CardTitle>
            <CardDescription>
              List of billing transactions within the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Patient</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Payment Method</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.data.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="p-2">{transaction.patient_name}</td>
                          <td className="p-2">₱{transaction.amount.toLocaleString()}</td>
                          <td className="p-2">{transaction.payment_method}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="p-2">{new Date(transaction.created_at).toLocaleDateString()}</td>
                          <td className="p-2">{transaction.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No transactions found for the selected period.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
