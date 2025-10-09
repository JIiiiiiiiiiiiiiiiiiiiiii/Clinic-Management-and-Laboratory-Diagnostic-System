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
import { ArrowLeft, Send, User, Search, Stethoscope, AlertTriangle, FileText } from 'lucide-react';

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Refer Patient - Hospital" />
      
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Refer Patient</h1>
            <p className="text-muted-foreground">
              Create a referral for a patient to see a specialist or another healthcare provider
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
                Choose the patient you want to refer to a specialist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="patient_search">Search Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="patient_search"
                    placeholder="Search by patient name or number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Type to filter the patient list below
                </p>
              </div>

              <div>
                <Label htmlFor="patient_id">Select Patient *</Label>
                <Select value={formData.patient_id} onValueChange={(value) => handleInputChange('patient_id', value)}>
                  <SelectTrigger className={errors.patient_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Choose a patient from the list" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPatients.length === 0 ? (
                      <SelectItem value="" disabled>
                        {searchTerm ? 'No patients found matching your search' : 'No patients available'}
                      </SelectItem>
                    ) : (
                      filteredPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{patient.patient_no}</span>
                            <span className="text-muted-foreground">-</span>
                            <span>{patient.full_name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.patient_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.patient_id}</p>
                )}
                {filteredPatients.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredPatients.length} patient(s) found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Referral Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Referral Information
              </CardTitle>
              <CardDescription>
                Provide detailed information about the referral
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="referral_reason">Reason for Referral *</Label>
                <Textarea
                  id="referral_reason"
                  value={formData.referral_reason}
                  onChange={(e) => handleInputChange('referral_reason', e.target.value)}
                  placeholder="Describe the medical condition, symptoms, or reason for referring this patient to a specialist..."
                  rows={4}
                  className={errors.referral_reason ? 'border-red-500' : ''}
                />
                {errors.referral_reason && (
                  <p className="text-sm text-red-500 mt-1">{errors.referral_reason}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Include relevant medical history, current symptoms, and any preliminary findings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Low - Routine (within 2-4 weeks)
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Medium - Standard (within 1-2 weeks)
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          High - Urgent (within 3-5 days)
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Urgent - Emergency (immediate)
                        </div>
                      </SelectItem>
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
                      <SelectItem value="cardiologist">🫀 Cardiologist</SelectItem>
                      <SelectItem value="dermatologist">🧴 Dermatologist</SelectItem>
                      <SelectItem value="endocrinologist">⚕️ Endocrinologist</SelectItem>
                      <SelectItem value="gastroenterologist">🩺 Gastroenterologist</SelectItem>
                      <SelectItem value="gynecologist">👩‍⚕️ Gynecologist</SelectItem>
                      <SelectItem value="neurologist">🧠 Neurologist</SelectItem>
                      <SelectItem value="oncologist">🎗️ Oncologist</SelectItem>
                      <SelectItem value="ophthalmologist">👁️ Ophthalmologist</SelectItem>
                      <SelectItem value="orthopedist">🦴 Orthopedist</SelectItem>
                      <SelectItem value="pediatrician">👶 Pediatrician</SelectItem>
                      <SelectItem value="psychiatrist">🧠 Psychiatrist</SelectItem>
                      <SelectItem value="pulmonologist">🫁 Pulmonologist</SelectItem>
                      <SelectItem value="urologist">🔬 Urologist</SelectItem>
                      <SelectItem value="other">Other Specialist</SelectItem>
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
                  placeholder="Any additional information, special instructions, or notes for the specialist..."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include any specific requests, previous treatments, or important considerations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Referral Summary */}
          {formData.patient_id && formData.referral_reason && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Referral Summary
                </CardTitle>
                <CardDescription>
                  Review the referral details before submitting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Patient:</span>
                    <span>
                      {patients.find(p => p.id.toString() === formData.patient_id)?.full_name}
                    </span>
                  </div>
                  
                  {formData.priority && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Priority:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                        {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                      </span>
                    </div>
                  )}
                  
                  {formData.specialist_type && (
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Specialist:</span>
                      <span className="capitalize">{formData.specialist_type}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
