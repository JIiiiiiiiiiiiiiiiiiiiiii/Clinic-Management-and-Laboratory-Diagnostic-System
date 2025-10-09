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
  UserCheck, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';

interface Referral {
  id: number;
  patient: {
    full_name: string;
    patient_no: string;
  };
  specialist_type: string;
  referral_reason: string;
  priority: string;
  status: string;
  created_at: string;
  approved_at?: string;
  referred_by?: {
    name: string;
  };
  approved_by?: {
    name: string;
  };
}

interface SpecialistStats {
  total_referrals: number;
  approved_referrals: number;
  pending_referrals: number;
  rejected_referrals: number;
  by_specialist_type: Record<string, number>;
  by_priority: Record<string, number>;
  average_approval_time: number;
}

interface Props {
  user: any;
  referrals: {
    data: Referral[];
    links: any[];
    meta: any;
  };
  stats: SpecialistStats;
  dateRange: {
    start: string;
    end: string;
    period: string;
    label: string;
  };
  filters: {
    specialist_type?: string;
    status?: string;
    search?: string;
  };
}

export default function SpecialistManagementReports({ user, referrals, stats, dateRange, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Reports', href: route('hospital.reports.index') },
    { title: 'Specialist Management', href: route('hospital.reports.specialist.management') },
  ];

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedSpecialistType, setSelectedSpecialistType] = useState(filters.specialist_type || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedSpecialistType) params.set('specialist_type', selectedSpecialistType);
    if (selectedStatus) params.set('status', selectedStatus);
    
    router.get(route('hospital.reports.specialist.management'), Object.fromEntries(params), {
      preserveState: true,
      replace: true
    });
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedSpecialistType) params.set('specialist_type', selectedSpecialistType);
    if (selectedStatus) params.set('status', selectedStatus);
    
    window.location.href = `${route('hospital.reports.export', 'specialist_management')}?${params.toString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Specialist Management Reports" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Specialist Management Reports</h1>
            <p className="text-gray-600">Monitor specialist referrals and management</p>
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
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_referrals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved_referrals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_referrals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Approval Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_approval_time.toFixed(1)}h</div>
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
                  placeholder="Search referrals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="specialist_type">Specialist Type</Label>
                <Select value={selectedSpecialistType} onValueChange={setSelectedSpecialistType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All specialist types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All specialist types</SelectItem>
                    <SelectItem value="cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="neurologist">Neurologist</SelectItem>
                    <SelectItem value="orthopedist">Orthopedist</SelectItem>
                    <SelectItem value="pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                    <SelectItem value="surgeon">Surgeon</SelectItem>
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Specialist Referrals</CardTitle>
            <CardDescription>
              Showing {referrals.data.length} of {referrals.meta.total} referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Patient</th>
                    <th className="text-left p-2">Specialist Type</th>
                    <th className="text-left p-2">Priority</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Reason</th>
                    <th className="text-left p-2">Referred By</th>
                    <th className="text-left p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.data.map((referral) => (
                    <tr key={referral.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{referral.patient.full_name}</div>
                          <div className="text-sm text-gray-500">{referral.patient.patient_no}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{referral.specialist_type}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getPriorityColor(referral.priority)}>
                          {referral.priority}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(referral.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(referral.status)}
                            {referral.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-gray-600 max-w-xs truncate">
                        {referral.referral_reason}
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {referral.referred_by?.name || '-'}
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(referral.created_at).toLocaleDateString()}
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
