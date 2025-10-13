import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Stethoscope, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Visit {
  id: number;
  visit_number: string;
  visit_date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  reason: string;
  diagnosis?: string;
  prescription?: string;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    patient_no: string;
  };
  doctor: {
    id: number;
    name: string;
  };
  appointment?: {
    id: number;
    appointment_type: string;
  };
  billing?: {
    id: number;
    total_amount: number;
  };
}

interface Doctor {
  id: number;
  name: string;
}

interface Props {
  visits: {
    data: Visit[];
    links: any[];
    meta: any;
  };
  doctors: Doctor[];
  filters: {
    status?: string;
    doctor_id?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Visit Management', href: '/admin/visits' },
];

export default function VisitsIndex({ visits, doctors, filters }: Props) {
  // Ensure visits has proper structure
  const safeVisits = visits || { data: [], meta: null, links: [] };
  const safeDoctors = doctors || [];
  
  const [search, setSearch] = useState(filters?.search || '');
  const [status, setStatus] = useState(filters?.status || 'all');
  const [doctorId, setDoctorId] = useState(filters?.doctor_id || 'all');
  const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
  const [dateTo, setDateTo] = useState(filters?.date_to || '');

  const handleFilter = () => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (status !== 'all') params.set('status', status);
    if (doctorId && doctorId !== 'all') params.set('doctor_id', doctorId);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    router.get(route('admin.visits.index'), Object.fromEntries(params), {
      preserveState: true,
      replace: true,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setDoctorId('all');
    setDateFrom('');
    setDateTo('');
    router.get(route('admin.visits.index'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Visit Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Visit Management</h1>
            <p className="text-muted-foreground">
              Manage patient visits, consultations, and medical records
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={route('admin.visits.today')}>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Today's Visits
              </Button>
            </Link>
            <Link href={route('admin.visits.create')}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Visit
              </Button>
            </Link>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {safeDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />

              <Input
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleFilter}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visits List */}
        <div className="space-y-6">
          {safeVisits.data.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Stethoscope className="h-16 w-16 text-muted-foreground mb-6" />
                <h3 className="text-xl font-semibold mb-3">No visits found</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  {filters && Object.values(filters).some(f => f) 
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by creating a new visit.'
                  }
                </p>
                <Link href={route('admin.visits.create')}>
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Visit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {safeVisits.data.map((visit) => (
                <Card key={visit.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                  <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {visit.patient.first_name} {visit.patient.last_name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {visit.patient.patient_no}
                        </Badge>
                        <Badge className={statusColors[visit.status]}>
                          {visit.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(visit.visit_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(visit.visit_date), 'h:mm a')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {visit.doctor.name}
                        </div>
                      </div>

                      {visit.reason && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Reason:</strong> {visit.reason}
                        </p>
                      )}

                      {visit.diagnosis && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Diagnosis:</strong> {visit.diagnosis}
                        </p>
                      )}

                      {visit.appointment && (
                        <Badge variant="secondary" className="text-xs">
                          {visit.appointment.appointment_type}
                        </Badge>
                      )}

                      {visit.billing && (
                        <p className="text-sm font-medium text-green-600">
                          Billing: ₱{visit.billing.total_amount.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={route('admin.visits.show', visit.id)}>
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      
                      {visit.status !== 'Completed' && (
                        <Link href={route('admin.visits.edit', visit.id)}>
                          <Button variant="outline" size="sm" className="hover:bg-green-50">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {safeVisits.data.length > 0 && safeVisits.meta && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {safeVisits.meta.from} to {safeVisits.meta.to} of {safeVisits.meta.total} results
            </p>
            <div className="flex gap-2">
              {safeVisits.links && safeVisits.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`px-3 py-2 text-sm rounded-md ${
                    link.active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
