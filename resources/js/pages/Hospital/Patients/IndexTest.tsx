import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

export default function HospitalPatientsIndexTest() {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: '/hospital/dashboard' },
    { label: 'Patients', href: '/hospital/patients' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Hospital Patients - Test" />
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Hospital Patients - Test</h1>
        <p className="text-muted-foreground">This is a test page to verify the route is working.</p>
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <p className="text-lg font-medium">If you see this page, the route is working!</p>
          <p className="text-sm text-gray-600">The issue was with the complex React component.</p>
        </div>
      </div>
    </AppLayout>
  );
}
