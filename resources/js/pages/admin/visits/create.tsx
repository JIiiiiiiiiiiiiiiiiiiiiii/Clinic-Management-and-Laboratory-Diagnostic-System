import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Stethoscope, ArrowLeft, Save } from 'lucide-react';
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
  patient: Patient;
}

interface Props {
  appointment?: Appointment;
  patient?: Patient;
  doctors: Doctor[];
  patients: Patient[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Visit Management', href: '/admin/visits' },
  { label: 'Create Visit', href: '/admin/visits/create' },
];

export default function CreateVisit({ appointment, patient, doctors, patients }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    patient_id: patient?.id || '',
    doctor_id: '',
    visit_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    reason: appointment?.appointment_type || '',
    vitals: {
      blood_pressure: '',
      temperature: '',
      heart_rate: '',
      respiratory_rate: '',
      weight: '',
      height: '',
      oxygen_saturation: '',
    },
    appointment_id: appointment?.id || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.visits.store'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Visit" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={route('admin.visits.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Visits
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Visit</h1>
            <p className="text-muted-foreground">
              Record a new patient visit and consultation
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
                <CardDescription>
                  Select the patient for this visit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointment ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">From Appointment</h4>
                    <p className="text-sm text-blue-700">
                      <strong>Patient:</strong> {appointment.patient.first_name} {appointment.patient.last_name} ({appointment.patient.patient_no})
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Type:</strong> {appointment.appointment_type}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Scheduled:</strong> {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')} at {appointment.appointment_time}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="patient_id">Patient *</Label>
                    <Select
                      value={data.patient_id.toString()}
                      onValueChange={(value) => setData('patient_id', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.first_name} {patient.last_name} ({patient.patient_no})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.patient_id && (
                      <p className="text-sm text-red-600">{errors.patient_id}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="doctor_id">Attending Doctor *</Label>
                  <Select
                    value={data.doctor_id.toString()}
                    onValueChange={(value) => setData('doctor_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.doctor_id && (
                    <p className="text-sm text-red-600">{errors.doctor_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit_date">Visit Date & Time *</Label>
                  <Input
                    id="visit_date"
                    type="datetime-local"
                    value={data.visit_date}
                    onChange={(e) => setData('visit_date', e.target.value)}
                  />
                  {errors.visit_date && (
                    <p className="text-sm text-red-600">{errors.visit_date}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Visit Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Visit Details
                </CardTitle>
                <CardDescription>
                  Record the reason for visit and initial observations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    placeholder="Describe the patient's complaint or reason for visit..."
                    rows={3}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Vital Signs
              </CardTitle>
              <CardDescription>
                Record patient's vital signs (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="blood_pressure">Blood Pressure</Label>
                  <Input
                    id="blood_pressure"
                    value={data.vitals.blood_pressure}
                    onChange={(e) => setData('vitals', { ...data.vitals, blood_pressure: e.target.value })}
                    placeholder="120/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={data.vitals.temperature}
                    onChange={(e) => setData('vitals', { ...data.vitals, temperature: e.target.value })}
                    placeholder="36.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                  <Input
                    id="heart_rate"
                    type="number"
                    value={data.vitals.heart_rate}
                    onChange={(e) => setData('vitals', { ...data.vitals, heart_rate: e.target.value })}
                    placeholder="72"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
                  <Input
                    id="respiratory_rate"
                    type="number"
                    value={data.vitals.respiratory_rate}
                    onChange={(e) => setData('vitals', { ...data.vitals, respiratory_rate: e.target.value })}
                    placeholder="16"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={data.vitals.weight}
                    onChange={(e) => setData('vitals', { ...data.vitals, weight: e.target.value })}
                    placeholder="70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={data.vitals.height}
                    onChange={(e) => setData('vitals', { ...data.vitals, height: e.target.value })}
                    placeholder="170"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                  <Input
                    id="oxygen_saturation"
                    type="number"
                    value={data.vitals.oxygen_saturation}
                    onChange={(e) => setData('vitals', { ...data.vitals, oxygen_saturation: e.target.value })}
                    placeholder="98"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href={route('admin.visits.index')}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Creating...' : 'Create Visit'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
