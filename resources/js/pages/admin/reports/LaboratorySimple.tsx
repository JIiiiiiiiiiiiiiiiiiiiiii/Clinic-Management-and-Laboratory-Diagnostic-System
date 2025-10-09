import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  TestTube, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface LabOrder {
  id: number;
  order_number?: string;
  patient: {
    full_name: string;
    patient_no: string;
  };
  labTests: Array<{
    name: string;
    code: string;
  }>;
  status: string;
  created_at: string;
  completed_at?: string;
  results?: any[];
}

interface LabStats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  cancelled_orders: number;
  by_test_type: Record<string, number>;
  average_processing_time: number;
}

interface Props {
  user: any;
  labOrders: {
    data: LabOrder[];
    links: any[];
    meta: any;
  };
  stats: LabStats;
  dateRange: {
    start: string;
    end: string;
    period: string;
    label: string;
  };
  filters: {
    test_type?: string;
    status?: string;
    search?: string;
  };
}

export default function AdminLaboratoryReports({ user, labOrders, stats, dateRange, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Reports', href: route('admin.reports.index') },
    { title: 'Laboratory Reports', href: route('admin.reports.laboratory') },
  ];

  // Safety checks for data
  const safeLabOrders = labOrders || { data: [], links: [], meta: {} };
  const safeStats = stats || {
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    cancelled_orders: 0,
    by_test_type: {},
    average_processing_time: 0
  };
  const safeFilters = filters || {};

  const [searchTerm, setSearchTerm] = useState(safeFilters.search || '');
  const [selectedTestType, setSelectedTestType] = useState(safeFilters.test_type || '');
  const [selectedStatus, setSelectedStatus] = useState(safeFilters.status || '');

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedTestType) params.set('test_type', selectedTestType);
    if (selectedStatus) params.set('status', selectedStatus);
    
    router.get(route('admin.reports.laboratory'), Object.fromEntries(params), {
      preserveState: true,
      replace: true
    });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedTestType) params.set('test_type', selectedTestType);
    if (selectedStatus) params.set('status', selectedStatus);
    
    window.location.href = `${route('admin.reports.export', 'laboratory')}?${params.toString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Laboratory Reports" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laboratory Reports</h1>
            <p className="text-gray-600">Track laboratory tests and results</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Date Range Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Period: {dateRange.label}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeStats.total_orders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{safeStats.completed_orders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{safeStats.pending_orders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeStats.average_processing_time.toFixed(1)}h</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="test_type">Test Type</Label>
                <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All test types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All test types</SelectItem>
                    <SelectItem value="blood">Blood Test</SelectItem>
                    <SelectItem value="urine">Urine Test</SelectItem>
                    <SelectItem value="stool">Stool Test</SelectItem>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="ultrasound">Ultrasound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleFilter} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lab Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Laboratory Orders</CardTitle>
            <CardDescription>
              Showing {safeLabOrders.data.length} of {safeLabOrders.meta.total} orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Order #</th>
                    <th className="text-left p-2">Patient</th>
                    <th className="text-left p-2">Test</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {safeLabOrders.data.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">{order.order_number || `#${order.id}`}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{order.patient?.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.patient?.patient_no || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{order.labTests?.[0]?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.labTests?.[0]?.code || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {order.completed_at ? new Date(order.completed_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
