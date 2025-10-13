import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, User, Stethoscope, ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';
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
  prescription?: string;
  vitals?: any;
  notes?: string;
  lab_request: boolean;
  follow_up_required: boolean;
  follow_up_date?: string;
  patient: Patient;
  doctor: Doctor;
  appointment?: Appointment;
}

interface Props {
  visit: Visit;
  doctors: Doctor[];
}

export default function EditVisit({ visit, doctors }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Visit Management', href: '/admin/visits' },
    { label: `Edit Visit ${visit.visit_number}`, href: `/admin/visits/${visit.id}/edit` },
  ];
  const { data, setData, put, processing, errors } = useForm({
    doctor_id: visit.doctor?.id || '',
    visit_date: format(new Date(visit.visit_date), 'yyyy-MM-dd\'T\'HH:mm'),
    reason: visit.reason || '',
    diagnosis: visit.diagnosis || '',
    prescription: visit.prescription || '',
    vitals: visit.vitals ? {
      blood_pressure: visit.vitals.blood_pressure || '',
      temperature: visit.vitals.temperature || '',
      heart_rate: visit.vitals.heart_rate || '',
      respiratory_rate: visit.vitals.respiratory_rate || '',
      weight: visit.vitals.weight || '',
      height: visit.vitals.height || '',
      oxygen_saturation: visit.vitals.oxygen_saturation || '',
    } : {
      blood_pressure: '',
      temperature: '',
      heart_rate: '',
      respiratory_rate: '',
      weight: '',
      height: '',
      oxygen_saturation: '',
    },
    notes: visit.notes || '',
    lab_request: visit.lab_request,
    follow_up_required: visit.follow_up_required,
    follow_up_date: visit.follow_up_date || '',
    status: visit.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.visits.update', visit.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Visit ${visit.visit_number}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={route('admin.visits.show', visit.id)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Visit
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Visit {visit.visit_number}
            </h1>
            <p className="text-muted-foreground">
              {visit.patient.first_name} {visit.patient.last_name} • {visit.patient.patient_no}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visit Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Visit Information
                </CardTitle>
                <CardDescription>
                  Update visit details and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={data.status}
                    onValueChange={(value) => setData('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status}</p>
                  )}
                </div>

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

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Medical Information
                </CardTitle>
                <CardDescription>
                  Record diagnosis, prescription, and notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    value={data.diagnosis}
                    onChange={(e) => setData('diagnosis', e.target.value)}
                    placeholder="Enter diagnosis..."
                    rows={3}
                  />
                  {errors.diagnosis && (
                    <p className="text-sm text-red-600">{errors.diagnosis}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription</Label>
                  <Textarea
                    id="prescription"
                    value={data.prescription}
                    onChange={(e) => setData('prescription', e.target.value)}
                    placeholder="Enter prescription details..."
                    rows={3}
                  />
                  {errors.prescription && (
                    <p className="text-sm text-red-600">{errors.prescription}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-600">{errors.notes}</p>
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
                Update patient's vital signs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lab_request"
                  checked={data.lab_request}
                  onCheckedChange={(checked) => setData('lab_request', checked as boolean)}
                />
                <Label htmlFor="lab_request">Laboratory test requested</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="follow_up_required"
                  checked={data.follow_up_required}
                  onCheckedChange={(checked) => setData('follow_up_required', checked as boolean)}
                />
                <Label htmlFor="follow_up_required">Follow-up required</Label>
              </div>

              {data.follow_up_required && (
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow-up Date</Label>
                  <Input
                    id="follow_up_date"
                    type="date"
                    value={data.follow_up_date || ''}
                    onChange={(e) => setData('follow_up_date', e.target.value)}
                  />
                  {errors.follow_up_date && (
                    <p className="text-sm text-red-600">{errors.follow_up_date}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href={route('admin.visits.show', visit.id)}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Updating...' : 'Update Visit'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
