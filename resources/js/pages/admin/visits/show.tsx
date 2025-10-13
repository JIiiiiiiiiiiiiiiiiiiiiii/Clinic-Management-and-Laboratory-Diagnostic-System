import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  Pill, 
  TestTube, 
  CreditCard,
  CheckCircle,
  XCircle,
  Printer
} from 'lucide-react';
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
  appointment_date: string;
  appointment_time: string;
}

interface Billing {
  id: number;
  total_amount: number;
  status: string;
}

interface LabOrder {
  id: number;
  status: string;
  results: any[];
}

interface Visit {
  id: number;
  visit_number: string;
  visit_date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  reason: string;
  diagnosis?: string;
  prescription?: string;
  vitals?: any;
  notes?: string;
  lab_request: boolean;
  follow_up_required: boolean;
  follow_up_date?: string;
  patient: Patient;
  doctor: Doctor;
  appointment?: Appointment;
  billing?: Billing;
  labOrders: LabOrder[];
}

interface Props {
  visit: Visit;
}

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

export default function ShowVisit({ visit }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Visit Management', href: '/admin/visits' },
    { label: `Visit ${visit.visit_number}`, href: `/admin/visits/${visit.id}` },
  ];
  const handleComplete = () => {
    router.post(route('admin.visits.complete', visit.id));
  };

  const handleCancel = () => {
    router.post(route('admin.visits.cancel', visit.id));
  };

  const handlePrint = () => {
    router.get(route('admin.visits.summary', visit.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Visit ${visit.visit_number}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('admin.visits.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Visits
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Visit {visit.visit_number}
              </h1>
              <p className="text-muted-foreground">
                {visit.patient.first_name} {visit.patient.last_name} • {visit.patient.patient_no}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusColors[visit.status]}>
              {visit.status}
            </Badge>
            
            {visit.status !== 'Completed' && visit.status !== 'Cancelled' && (
              <Link href={route('admin.visits.edit', visit.id)}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visit Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Visit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">{format(new Date(visit.visit_date), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Time:</span>
                    <span className="text-sm">{format(new Date(visit.visit_date), 'h:mm a')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Doctor:</span>
                    <span className="text-sm">{visit.doctor.name}</span>
                  </div>
                  
                  {visit.appointment && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Appointment:</span>
                      <Badge variant="secondary" className="text-xs">
                        {visit.appointment.appointment_type}
                      </Badge>
                    </div>
                  )}
                </div>

                {visit.reason && (
                  <div>
                    <h4 className="font-medium mb-2">Reason for Visit</h4>
                    <p className="text-sm text-muted-foreground">{visit.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visit.diagnosis && (
                  <div>
                    <h4 className="font-medium mb-2">Diagnosis</h4>
                    <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
                  </div>
                )}

                {visit.prescription && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Prescription
                    </h4>
                    <p className="text-sm text-muted-foreground">{visit.prescription}</p>
                  </div>
                )}

                {visit.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{visit.notes}</p>
                  </div>
                )}

                {visit.follow_up_required && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Follow-up Required</h4>
                    <p className="text-sm text-blue-700">
                      {visit.follow_up_date 
                        ? `Scheduled for ${format(new Date(visit.follow_up_date), 'MMM dd, yyyy')}`
                        : 'Follow-up date to be determined'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vitals */}
            {visit.vitals && Object.values(visit.vitals).some(v => v) && (
              <Card>
                <CardHeader>
                  <CardTitle>Vital Signs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {visit.vitals.blood_pressure && (
                      <div>
                        <p className="text-sm font-medium">Blood Pressure</p>
                        <p className="text-lg font-semibold">{visit.vitals.blood_pressure}</p>
                      </div>
                    )}
                    {visit.vitals.temperature && (
                      <div>
                        <p className="text-sm font-medium">Temperature</p>
                        <p className="text-lg font-semibold">{visit.vitals.temperature}°C</p>
                      </div>
                    )}
                    {visit.vitals.heart_rate && (
                      <div>
                        <p className="text-sm font-medium">Heart Rate</p>
                        <p className="text-lg font-semibold">{visit.vitals.heart_rate} bpm</p>
                      </div>
                    )}
                    {visit.vitals.respiratory_rate && (
                      <div>
                        <p className="text-sm font-medium">Respiratory Rate</p>
                        <p className="text-lg font-semibold">{visit.vitals.respiratory_rate}</p>
                      </div>
                    )}
                    {visit.vitals.weight && (
                      <div>
                        <p className="text-sm font-medium">Weight</p>
                        <p className="text-lg font-semibold">{visit.vitals.weight} kg</p>
                      </div>
                    )}
                    {visit.vitals.height && (
                      <div>
                        <p className="text-sm font-medium">Height</p>
                        <p className="text-lg font-semibold">{visit.vitals.height} cm</p>
                      </div>
                    )}
                    {visit.vitals.oxygen_saturation && (
                      <div>
                        <p className="text-sm font-medium">Oxygen Saturation</p>
                        <p className="text-lg font-semibold">{visit.vitals.oxygen_saturation}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {visit.status === 'In Progress' && (
                  <Button onClick={handleComplete} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Visit
                  </Button>
                )}
                
                {visit.status !== 'Completed' && visit.status !== 'Cancelled' && (
                  <Button variant="destructive" onClick={handleCancel} className="w-full">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Visit
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Lab Requests */}
            {visit.lab_request && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Laboratory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">Lab Requested</Badge>
                    {visit.labOrders && visit.labOrders.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {visit.labOrders.length} lab order(s) pending
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing */}
            {visit.billing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Amount:</span>
                      <span className="text-sm font-semibold">₱{visit.billing.total_amount.toFixed(2)}</span>
                    </div>
                    <Badge variant={visit.billing.status === 'paid' ? 'default' : 'secondary'}>
                      {visit.billing.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {visit.patient.first_name} {visit.patient.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Patient No.</p>
                    <p className="text-sm text-muted-foreground">{visit.patient.patient_no}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <Link href={route('admin.patient.show', visit.patient.id)}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Patient Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
