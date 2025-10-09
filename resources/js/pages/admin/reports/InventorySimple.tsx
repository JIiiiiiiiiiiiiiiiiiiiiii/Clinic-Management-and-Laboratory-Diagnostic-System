import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Package, Download, ArrowLeft } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  unit_price: number;
  last_updated: string;
}

interface InventoryStats {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_value: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  user: any;
  inventory: {
    data: InventoryItem[];
    links: any[];
    meta: any;
  };
  stats: InventoryStats;
  dateRange: DateRange;
  filters: any;
}

export default function AdminReportsInventory({ user, inventory, stats, dateRange, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Reports', href: route('admin.reports.index') },
    { title: 'Inventory Reports', href: route('admin.reports.inventory') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Inventory Reports" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
            <p className="text-gray-600">Track supply usage and stock levels</p>
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
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_items}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <Package className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.low_stock_items}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <Package className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.out_of_stock_items}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₱{stats.total_value.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Report Period: {dateRange.start} to {dateRange.end}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              Current inventory status and stock levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Item Name</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Current Stock</th>
                        <th className="text-left p-2">Min Stock</th>
                        <th className="text-left p-2">Unit Price</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.data.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.category}</td>
                          <td className="p-2">{item.current_stock}</td>
                          <td className="p-2">{item.minimum_stock}</td>
                          <td className="p-2">₱{item.unit_price.toLocaleString()}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.current_stock === 0 ? 'bg-red-100 text-red-800' :
                              item.current_stock <= item.minimum_stock ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.current_stock === 0 ? 'Out of Stock' :
                               item.current_stock <= item.minimum_stock ? 'Low Stock' :
                               'In Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No inventory items found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
