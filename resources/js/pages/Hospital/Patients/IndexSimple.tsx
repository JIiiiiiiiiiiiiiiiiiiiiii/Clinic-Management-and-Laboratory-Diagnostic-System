import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Users, Plus, Search } from 'lucide-react';

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

interface Props {
  patients: {
    data: Patient[];
    links: any[];
    meta: any;
  };
  stats: PatientStats;
  filters: any;
}

export default function HospitalPatientsIndex({ patients, stats, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Patients', href: route('hospital.patients.index') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Hospital Patients" />
      
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hospital Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={route('hospital.patients.create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={route('hospital.patients.refer')}>
                <Users className="h-4 w-4 mr-2" />
                Refer Patient
              </Link>
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
            <CardTitle>Patients List</CardTitle>
            <CardDescription>View and manage all patient records</CardDescription>
          </CardHeader>
          <CardContent>
            {patients.data.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No patients found</h3>
                <p className="text-muted-foreground mb-4">Get started by adding a new patient</p>
                <Button asChild>
                  <Link href={route('hospital.patients.create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Patient
                  </Link>
                </Button>
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
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={route('hospital.patients.show', patient.id)}>
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={route('hospital.patients.edit', patient.id)}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
