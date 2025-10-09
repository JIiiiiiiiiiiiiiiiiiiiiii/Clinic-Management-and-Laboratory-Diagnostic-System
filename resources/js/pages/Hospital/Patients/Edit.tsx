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
import { ArrowLeft, Save, User } from 'lucide-react';

interface Patient {
  id: number;
  patient_no: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  birthdate: string;
  sex: string;
  mobile_no?: string;
  telephone_no?: string;
  present_address?: string;
  occupation?: string;
  civil_status?: string;
  nationality?: string;
  religion?: string;
  informant_name?: string;
  relationship?: string;
  drug_allergies?: string;
  food_allergies?: string;
  past_medical_history?: string;
  family_history?: string;
  social_personal_history?: string;
  obstetrics_gynecology_history?: string;
}

interface Props {
  patient: Patient;
}

export default function HospitalPatientEdit({ patient }: Props) {
  const [formData, setFormData] = useState({
    first_name: patient.first_name,
    last_name: patient.last_name,
    middle_name: patient.middle_name || '',
    birthdate: patient.birthdate,
    sex: patient.sex,
    mobile_no: patient.mobile_no || '',
    telephone_no: patient.telephone_no || '',
    present_address: patient.present_address || '',
    occupation: patient.occupation || '',
    civil_status: patient.civil_status || '',
    nationality: patient.nationality || '',
    religion: patient.religion || '',
    informant_name: patient.informant_name || '',
    relationship: patient.relationship || '',
    drug_allergies: patient.drug_allergies || '',
    food_allergies: patient.food_allergies || '',
    past_medical_history: patient.past_medical_history || '',
    family_history: patient.family_history || '',
    social_personal_history: patient.social_personal_history || '',
    obstetrics_gynecology_history: patient.obstetrics_gynecology_history || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Patients', href: route('hospital.patients.index') },
    { label: patient.first_name + ' ' + patient.last_name, href: route('hospital.patients.show', patient.id) },
    { label: 'Edit', href: route('hospital.patients.edit', patient.id) },
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

    router.put(route('hospital.patients.update', patient.id), formData, {
      onError: (errors) => {
        setErrors(errors);
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${patient.first_name} ${patient.last_name} - Hospital`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
            <p className="text-muted-foreground">
              Update patient information for {patient.first_name} {patient.last_name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={route('hospital.patients.show', patient.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patient
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Patient's personal details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={errors.first_name ? 'border-red-500' : ''}
                  />
                  {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={errors.last_name ? 'border-red-500' : ''}
                  />
                  {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
                </div>
                <div>
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={formData.middle_name}
                    onChange={(e) => handleInputChange('middle_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthdate">Date of Birth *</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => handleInputChange('birthdate', e.target.value)}
                    className={errors.birthdate ? 'border-red-500' : ''}
                  />
                  {errors.birthdate && <p className="text-sm text-red-500 mt-1">{errors.birthdate}</p>}
                </div>
                <div>
                  <Label htmlFor="sex">Sex *</Label>
                  <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                    <SelectTrigger className={errors.sex ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sex && <p className="text-sm text-red-500 mt-1">{errors.sex}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Patient's contact details and address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile_no">Mobile Number</Label>
                  <Input
                    id="mobile_no"
                    value={formData.mobile_no}
                    onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="telephone_no">Telephone Number</Label>
                  <Input
                    id="telephone_no"
                    value={formData.telephone_no}
                    onChange={(e) => handleInputChange('telephone_no', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="present_address">Present Address</Label>
                <Textarea
                  id="present_address"
                  value={formData.present_address}
                  onChange={(e) => handleInputChange('present_address', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="civil_status">Civil Status</Label>
                  <Select value={formData.civil_status} onValueChange={(value) => handleInputChange('civil_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select civil status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Additional personal and demographic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="informant_name">Informant Name</Label>
                  <Input
                    id="informant_name"
                    value={formData.informant_name}
                    onChange={(e) => handleInputChange('informant_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => handleInputChange('relationship', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>
                Medical history, allergies, and health information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drug_allergies">Drug Allergies</Label>
                  <Textarea
                    id="drug_allergies"
                    value={formData.drug_allergies}
                    onChange={(e) => handleInputChange('drug_allergies', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="food_allergies">Food Allergies</Label>
                  <Textarea
                    id="food_allergies"
                    value={formData.food_allergies}
                    onChange={(e) => handleInputChange('food_allergies', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="past_medical_history">Past Medical History</Label>
                <Textarea
                  id="past_medical_history"
                  value={formData.past_medical_history}
                  onChange={(e) => handleInputChange('past_medical_history', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="family_history">Family History</Label>
                <Textarea
                  id="family_history"
                  value={formData.family_history}
                  onChange={(e) => handleInputChange('family_history', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="social_personal_history">Social/Personal History</Label>
                <Textarea
                  id="social_personal_history"
                  value={formData.social_personal_history}
                  onChange={(e) => handleInputChange('social_personal_history', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="obstetrics_gynecology_history">Obstetrics/Gynecology History</Label>
                <Textarea
                  id="obstetrics_gynecology_history"
                  value={formData.obstetrics_gynecology_history}
                  onChange={(e) => handleInputChange('obstetrics_gynecology_history', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href={route('hospital.patients.show', patient.id)}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Patient'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
