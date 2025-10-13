import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Stethoscope, Printer } from 'lucide-react';
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
  billing?: Billing;
  labOrders: LabOrder[];
}

interface Summary {
  visit_number: string;
  patient_name: string;
  patient_no: string;
  visit_date: string;
  doctor: string;
  reason: string;
  diagnosis: string;
  prescription: string;
  vitals: string;
  lab_requested: boolean;
  follow_up_required: boolean;
  follow_up_date?: string;
  billing_amount: string;
}

interface Props {
  visit: Visit;
  summary: Summary;
}

export default function VisitSummary({ visit, summary }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Visit Management', href: '/admin/visits' },
    { label: `Visit ${visit.visit_number}`, href: `/admin/visits/${visit.id}` },
    { label: 'Summary', href: `/admin/visits/${visit.id}/summary` },
  ];
  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Visit Summary - ${visit.visit_number}`} />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Print Button - Hidden when printing */}
        <div className="mb-6 print:hidden">
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Summary
          </Button>
        </div>

        {/* Visit Summary Document */}
        <div className="bg-white print:shadow-none">
          {/* Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              St. James Clinic
            </h1>
            <h2 className="text-xl text-gray-700 mb-4">Visit Summary Report</h2>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(), 'MMMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(), 'h:mm a')}
              </div>
            </div>
          </div>

          {/* Visit Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Visit Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Visit Number</p>
                  <p className="text-lg font-semibold">{summary.visit_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-lg font-semibold">{summary.visit_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p className="text-lg font-semibold">{summary.patient_name}</p>
                  <p className="text-sm text-gray-600">ID: {summary.patient_no}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Attending Doctor</p>
                  <p className="text-lg font-semibold">{summary.doctor}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.reason && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Reason for Visit</h4>
                  <p className="text-gray-700">{summary.reason}</p>
                </div>
              )}

              {summary.diagnosis && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-gray-700">{summary.diagnosis}</p>
                </div>
              )}

              {summary.prescription && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prescription</h4>
                  <p className="text-gray-700">{summary.prescription}</p>
                </div>
              )}

              {summary.vitals && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Vital Signs</h4>
                  <p className="text-gray-700">{summary.vitals}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Laboratory Requested</p>
                  <Badge variant={summary.lab_requested ? "default" : "secondary"}>
                    {summary.lab_requested ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Follow-up Required</p>
                  <Badge variant={summary.follow_up_required ? "default" : "secondary"}>
                    {summary.follow_up_required ? "Yes" : "No"}
                  </Badge>
                </div>

                {summary.follow_up_date && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Follow-up Date</p>
                    <p className="text-lg font-semibold">{summary.follow_up_date}</p>
                  </div>
                )}

                {summary.billing_amount && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Billing Amount</p>
                    <p className="text-lg font-semibold text-green-600">{summary.billing_amount}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>This is a computer-generated report from St. James Clinic Management System</p>
            <p className="mt-1">Generated on {format(new Date(), 'MMMM dd, yyyy \'at\' h:mm a')}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}
