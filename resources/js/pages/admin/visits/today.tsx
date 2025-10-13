import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Stethoscope, ArrowLeft, Plus, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  patient_no: string;
}

interface Doctor {
  id: number;
  name: string;
}

interface Appointment {
  id: number;
  appointment_type: string;
}

interface Visit {
  id: number;
  visit_number: string;
  visit_date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  reason: string;
  diagnosis?: string;
  patient: Patient;
  doctor: Doctor;
  appointment?: Appointment;
}

interface Props {
  visits: Visit[];
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
  { label: "Today's Visits", href: '/admin/visits/today' },
];

export default function TodayVisits({ visits }: Props) {
  const today = format(new Date(), 'EEEE, MMMM dd, yyyy');
  
  const pendingVisits = visits.filter(v => v.status === 'Pending');
  const inProgressVisits = visits.filter(v => v.status === 'In Progress');
  const completedVisits = visits.filter(v => v.status === 'Completed');

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Today's Visits" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('admin.visits.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Visits
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Today's Visits</h1>
              <p className="text-muted-foreground">{today}</p>
            </div>
          </div>
          <Link href={route('admin.visits.create')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Visit
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-yellow-100 rounded-xl">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingVisits.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-xl">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{inProgressVisits.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-xl">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedVisits.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visits by Status */}
        <div className="space-y-6">
          {/* Pending Visits */}
          {pendingVisits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Visits ({pendingVisits.length})
                </CardTitle>
                <CardDescription>
                  Visits waiting to be started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingVisits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-6 border rounded-xl hover:shadow-md transition-shadow bg-yellow-50/30">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-lg">
                            {visit.patient.first_name} {visit.patient.last_name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {visit.patient.patient_no}
                          </Badge>
                          <Badge className={statusColors[visit.status]}>
                            {visit.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(visit.visit_date), 'h:mm a')}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {visit.doctor.name}
                          </div>
                          {visit.appointment && (
                            <Badge variant="secondary" className="text-xs">
                              {visit.appointment.appointment_type}
                            </Badge>
                          )}
                        </div>
                        {visit.reason && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Reason:</strong> {visit.reason}
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
                        <Link href={route('admin.visits.edit', visit.id)}>
                          <Button variant="outline" size="sm" className="hover:bg-green-50">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* In Progress Visits */}
          {inProgressVisits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  In Progress ({inProgressVisits.length})
                </CardTitle>
                <CardDescription>
                  Visits currently being conducted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressVisits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">
                            {visit.patient.first_name} {visit.patient.last_name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {visit.patient.patient_no}
                          </Badge>
                          <Badge className={statusColors[visit.status]}>
                            {visit.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={route('admin.visits.show', visit.id)}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={route('admin.visits.edit', visit.id)}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Visits */}
          {completedVisits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Completed ({completedVisits.length})
                </CardTitle>
                <CardDescription>
                  Visits completed today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedVisits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">
                            {visit.patient.first_name} {visit.patient.last_name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {visit.patient.patient_no}
                          </Badge>
                          <Badge className={statusColors[visit.status]}>
                            {visit.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(visit.visit_date), 'h:mm a')}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {visit.doctor.name}
                          </div>
                        </div>
                        {visit.diagnosis && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Diagnosis:</strong> {visit.diagnosis}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={route('admin.visits.show', visit.id)}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Visits */}
          {visits.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No visits today</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No patient visits scheduled for today.
                </p>
                <Link href={route('admin.visits.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Visit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
