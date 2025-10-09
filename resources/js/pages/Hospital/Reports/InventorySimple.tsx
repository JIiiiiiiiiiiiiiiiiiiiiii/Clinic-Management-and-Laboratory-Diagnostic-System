import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Package, Download, ArrowLeft } from 'lucide-react';

interface InventoryTransaction {
  id: number;
  product_name: string;
  type: string;
  quantity: number;
  transaction_date: string;
  lot_number: string;
}

interface InventoryStats {
  total_transactions: number;
  total_products: number;
  low_stock_items: number;
  out_of_stock_items: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  user: any;
  transactions: {
    data: InventoryTransaction[];
    links: any[];
    meta: any;
  };
  stats: InventoryStats;
  dateRange: DateRange;
  filters: any;
}

export default function HospitalReportsInventory({ user, transactions, stats, dateRange, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Inventory Reports', href: route('hospital.reports.inventory') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Inventory Reports" />
      
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
              <h1 className="text-3xl font-bold tracking-tight">Inventory Reports</h1>
              <p className="text-muted-foreground">Supply usage and stock level statistics</p>
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
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_transactions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_products}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.low_stock_items}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.out_of_stock_items}</div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Transactions</CardTitle>
            <CardDescription>Supply transaction data for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.data.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No inventory data found</h3>
                <p className="text-muted-foreground">No inventory transactions match the current filters or date range.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.data.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{transaction.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {transaction.type} • Lot: {transaction.lot_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Qty: {transaction.quantity}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </div>
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
