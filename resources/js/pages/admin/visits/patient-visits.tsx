import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, Stethoscope, Eye, Plus } from 'lucide-react';
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

interface Billing {
  id: number;
  total_amount: number;
  status: string;
}

interface Visit {
  id: number;
  visit_number: string;
  visit_date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  reason: string;
  diagnosis?: string;
  prescription?: string;
  patient: Patient;
  doctor: Doctor;
  appointment?: Appointment;
  billing?: Billing;
}

interface Props {
  patient: Patient;
  visits: {
    data: Visit[];
    links: any[];
    meta: any;
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
  { label: 'Patients', href: '/admin/patient' },
  { label: `${patient.first_name} ${patient.last_name}`, href: `/admin/patient/${patient.id}` },
  { label: 'Visit History', href: `/admin/patients/${patient.id}/visits` },
];

export default function PatientVisits({ patient, visits }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Visit History - ${patient.first_name} ${patient.last_name}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('admin.patient.show', patient.id)}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Visit History
              </h1>
              <p className="text-muted-foreground">
                {patient.first_name} {patient.last_name} • {patient.patient_no}
              </p>
            </div>
          </div>
          <Link href={route('admin.visits.create', { patient_id: patient.id })}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Visit
            </Button>
          </Link>
        </div>

        {/* Patient Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
                <p className="text-lg font-semibold">
                  {patient.first_name} {patient.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient Number</p>
                <p className="text-lg font-semibold">{patient.patient_no}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                <p className="text-lg font-semibold">{visits.meta.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visits List */}
        <div className="space-y-4">
          {visits.data.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No visits found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  This patient has no visit records yet.
                </p>
                <Link href={route('admin.visits.create', { patient_id: patient.id })}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Visit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            visits.data.map((visit) => (
              <Card key={visit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          Visit {visit.visit_number}
                        </h3>
                        <Badge className={statusColors[visit.status]}>
                          {visit.status}
                        </Badge>
                        {visit.appointment && (
                          <Badge variant="secondary" className="text-xs">
                            {visit.appointment.appointment_type}
                          </Badge>
                        )}
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

                      {visit.prescription && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Prescription:</strong> {visit.prescription}
                        </p>
                      )}

                      {visit.billing && (
                        <p className="text-sm font-medium text-green-600">
                          Billing: ₱{visit.billing.total_amount.toFixed(2)} ({visit.billing.status})
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
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {visits.data.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {visits.meta.from} to {visits.meta.to} of {visits.meta.total} results
            </p>
            <div className="flex gap-2">
              {visits.links.map((link, index) => (
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
