import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Users, Download, ArrowLeft } from 'lucide-react';

interface Patient {
  id: number;
  patient_no: string;
  first_name: string;
  last_name: string;
  full_name: string;
  age: number;
  sex: string;
  created_at: string;
}

interface PatientStats {
  total_patients: number;
  male_patients: number;
  female_patients: number;
  new_this_month: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  user: any;
  patients: {
    data: Patient[];
    links: any[];
    meta: any;
  };
  stats: PatientStats;
  dateRange: DateRange;
  filters: any;
}

export default function HospitalReportsPatients({ user, patients, stats, dateRange, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Reports', href: route('hospital.reports.index') },
    { label: 'Patient Reports', href: route('hospital.reports.patients') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Patient Reports" />
      
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
              <h1 className="text-3xl font-bold tracking-tight">Patient Reports</h1>
              <p className="text-muted-foreground">Patient statistics and demographics</p>
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
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_patients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Male Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.male_patients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Female Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.female_patients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new_this_month}</div>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>Patient data for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {patients.data.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No patient data found</h3>
                <p className="text-muted-foreground">No patients match the current filters or date range.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patients.data.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{patient.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Patient #{patient.patient_no} • {patient.age} years old • {patient.sex}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Registered: {new Date(patient.created_at).toLocaleDateString()}
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
