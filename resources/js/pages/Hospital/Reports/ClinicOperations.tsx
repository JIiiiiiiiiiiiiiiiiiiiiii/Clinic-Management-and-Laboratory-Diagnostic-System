import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  Users, 
  Calendar, 
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';

interface ClinicOperationsStats {
  total_patients: number;
  total_appointments: number;
  completed_appointments: number;
  total_revenue: number;
  average_appointment_duration: number;
  patient_satisfaction_score: number;
}

interface DateRange {
  start: string;
  end: string;
  period: string;
  label: string;
}

interface Props {
  user: any;
  stats: ClinicOperationsStats;
  dateRange: DateRange;
}

export default function HospitalClinicOperationsReports({ user, stats, dateRange }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Reports', href: route('hospital.reports.index') },
    { label: 'Clinic Operations', href: route('hospital.reports.clinic.operations') },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Clinic Operations Reports - Hospital" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clinic Operations</h1>
            <p className="text-muted-foreground">
              Comprehensive clinic operations analytics for {dateRange.label}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={route('hospital.reports.index')}>
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_patients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Patients registered in period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_appointments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Appointments scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_appointments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{stats.total_revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Revenue generated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Appointment Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_appointment_duration} min</div>
              <p className="text-xs text-muted-foreground">
                Average session length
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.patient_satisfaction_score}/5.0</div>
              <p className="text-xs text-muted-foreground">
                Satisfaction rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Completion Rate</CardTitle>
              <CardDescription>
                Percentage of appointments successfully completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">
                    {stats.total_appointments > 0 
                      ? ((stats.completed_appointments / stats.total_appointments) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${stats.total_appointments > 0 
                        ? (stats.completed_appointments / stats.total_appointments) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue per Patient</CardTitle>
              <CardDescription>
                Average revenue generated per patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Revenue per Patient</span>
                  <span className="font-medium">
                    ₱{stats.total_patients > 0 
                      ? (stats.total_revenue / stats.total_patients).toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Based on {stats.total_patients} patients</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operations Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Operations Summary</CardTitle>
            <CardDescription>
              Key performance indicators for clinic operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Patient Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">New Patients</span>
                    <span className="font-medium">{stats.total_patients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Patient Satisfaction</span>
                    <span className="font-medium">{stats.patient_satisfaction_score}/5.0</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Appointment Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Scheduled</span>
                    <span className="font-medium">{stats.total_appointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-medium">{stats.completed_appointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Duration</span>
                    <span className="font-medium">{stats.average_appointment_duration} min</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
