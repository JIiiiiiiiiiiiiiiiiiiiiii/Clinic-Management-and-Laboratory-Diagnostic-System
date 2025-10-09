import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Send, User, Search } from 'lucide-react';

interface Patient {
  id: number;
  patient_no: string;
  full_name: string;
}

interface Props {
  patients?: Patient[];
}

export default function HospitalPatientRefer({ patients = [] }: Props) {
  const [formData, setFormData] = useState({
    patient_id: '',
    referral_reason: '',
    priority: '',
    specialist_type: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Patients', href: route('hospital.patients.index') },
    { label: 'Refer Patient', href: route('hospital.patients.refer') },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    router.post(route('hospital.patients.refer.process'), formData, {
      onError: (errors) => {
        setErrors(errors);
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setIsSubmitting(false);
      }
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_no.includes(searchTerm)
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Refer Patient - Hospital" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refer Patient</h1>
            <p className="text-muted-foreground">
              Create a referral for a patient to see a specialist
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('hospital.patients.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Patient
              </CardTitle>
              <CardDescription>
                Choose the patient to refer to a specialist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="patient_search">Search Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patient_search"
                    placeholder="Search by name or patient number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="patient_id">Patient *</Label>
                <Select value={formData.patient_id} onValueChange={(value) => handleInputChange('patient_id', value)}>
                  <SelectTrigger className={errors.patient_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.patient_no} - {patient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patient_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.patient_id}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Referral Details */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Information</CardTitle>
              <CardDescription>
                Provide details about the referral
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="referral_reason">Reason for Referral *</Label>
                <Textarea
                  id="referral_reason"
                  value={formData.referral_reason}
                  onChange={(e) => handleInputChange('referral_reason', e.target.value)}
                  placeholder="Describe the reason for referring this patient..."
                  rows={4}
                  className={errors.referral_reason ? 'border-red-500' : ''}
                />
                {errors.referral_reason && (
                  <p className="text-sm text-red-500 mt-1">{errors.referral_reason}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Routine</SelectItem>
                      <SelectItem value="medium">Medium - Standard</SelectItem>
                      <SelectItem value="high">High - Urgent</SelectItem>
                      <SelectItem value="urgent">Urgent - Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="specialist_type">Specialist Type *</Label>
                  <Select value={formData.specialist_type} onValueChange={(value) => handleInputChange('specialist_type', value)}>
                    <SelectTrigger className={errors.specialist_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select specialist type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiologist">Cardiologist</SelectItem>
                      <SelectItem value="dermatologist">Dermatologist</SelectItem>
                      <SelectItem value="endocrinologist">Endocrinologist</SelectItem>
                      <SelectItem value="gastroenterologist">Gastroenterologist</SelectItem>
                      <SelectItem value="gynecologist">Gynecologist</SelectItem>
                      <SelectItem value="neurologist">Neurologist</SelectItem>
                      <SelectItem value="oncologist">Oncologist</SelectItem>
                      <SelectItem value="ophthalmologist">Ophthalmologist</SelectItem>
                      <SelectItem value="orthopedist">Orthopedist</SelectItem>
                      <SelectItem value="pediatrician">Pediatrician</SelectItem>
                      <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                      <SelectItem value="pulmonologist">Pulmonologist</SelectItem>
                      <SelectItem value="urologist">Urologist</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.specialist_type && (
                    <p className="text-sm text-red-500 mt-1">{errors.specialist_type}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information or special instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={route('hospital.patients.index')}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating Referral...' : 'Create Referral'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
