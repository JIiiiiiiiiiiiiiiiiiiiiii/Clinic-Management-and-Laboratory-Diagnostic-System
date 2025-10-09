import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Calendar, Download, ArrowLeft } from 'lucide-react';

interface Appointment {
  id: number;
  patient_name: string;
  specialist_name: string;
  appointment_date: string;
  status: string;
  specialist_type: string;
}

interface AppointmentStats {
  total_appointments: number;
  completed_appointments: number;
  pending_appointments: number;
  cancelled_appointments: number;
}

interface DateRange {
  start: string;
  end: string;
}

interface Props {
  user: any;
  appointments: {
    data: Appointment[];
    links: any[];
    meta: any;
  };
  stats: AppointmentStats;
  dateRange: DateRange;
  filters: any;
}

export default function AdminReportsAppointments({ user, appointments, stats, dateRange, filters }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Reports', href: route('admin.reports.index') },
    { title: 'Appointment Reports', href: route('admin.reports.appointments') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Appointment Reports" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Reports</h1>
            <p className="text-gray-600">Track appointment trends and status</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('admin.reports.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_appointments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed_appointments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_appointments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled_appointments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Period: {dateRange.start} to {dateRange.end}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>
              List of appointments within the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Patient</th>
                        <th className="text-left p-2">Specialist</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.data.map((appointment) => (
                        <tr key={appointment.id} className="border-b">
                          <td className="p-2">{appointment.patient_name}</td>
                          <td className="p-2">{appointment.specialist_name}</td>
                          <td className="p-2">{appointment.specialist_type}</td>
                          <td className="p-2">{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No appointments found for the selected period.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
