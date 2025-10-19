import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Eye
} from 'lucide-react';

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
  patient?: Patient;
  isEdit?: boolean;
}

export default function HospitalPatientEncoding({ patient, isEdit = false }: Props) {
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    middle_name: patient?.middle_name || '',
    birthdate: patient?.birthdate || '',
    sex: patient?.sex || '',
    mobile_no: patient?.mobile_no || '',
    telephone_no: patient?.telephone_no || '',
    present_address: patient?.present_address || '',
    occupation: patient?.occupation || '',
    civil_status: patient?.civil_status || '',
    nationality: patient?.nationality || '',
    religion: patient?.religion || '',
    informant_name: patient?.informant_name || '',
    relationship: patient?.relationship || '',
    drug_allergies: patient?.drug_allergies || '',
    food_allergies: patient?.food_allergies || '',
    past_medical_history: patient?.past_medical_history || '',
    family_history: patient?.family_history || '',
    social_personal_history: patient?.social_personal_history || '',
    obstetrics_gynecology_history: patient?.obstetrics_gynecology_history || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { title: 'Patients', href: route('hospital.patients.index') },
    { title: isEdit ? 'Edit Patient' : 'Add Patient', href: route('hospital.patients.create') },
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

    const routeName = isEdit ? 'hospital.patients.update' : 'hospital.patients.store';
    const routeParams = isEdit ? [patient?.id] : [];
    const method = isEdit ? 'put' : 'post';

    router[method](route(routeName, ...routeParams), formData, {
      onError: (errors) => {
        setErrors(errors);
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setIsSubmitting(false);
      }
    });
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 0;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSexColor = (sex: string) => {
    return sex === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${isEdit ? 'Edit' : 'Add'} Patient - Hospital`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? 'Edit Patient' : 'Add New Patient'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? `Update patient information for ${patient?.first_name} ${patient?.last_name}`
                : 'Register a new patient in the Saint James Hospital system'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={route('hospital.patients.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Link>
            </Button>
            {isEdit && (
              <Button variant="outline" asChild>
                <Link href={route('hospital.patients.show', patient?.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Patient
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Patient Preview */}
        {formData.first_name && formData.last_name && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Preview
              </CardTitle>
              <CardDescription>
                Preview of patient information before saving
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">
                      {formData.first_name} {formData.middle_name} {formData.last_name}
                    </h3>
                    {formData.sex && (
                      <Badge className={getSexColor(formData.sex)}>
                        {formData.sex.charAt(0).toUpperCase() + formData.sex.slice(1)}
                      </Badge>
                    )}
                    {formData.birthdate && (
                      <Badge variant="outline">
                        {calculateAge(formData.birthdate)} years old
                      </Badge>
                    )}
                  </div>
                  {formData.mobile_no && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {formData.mobile_no}
                    </div>
                  )}
                  {formData.present_address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {formData.present_address}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Patient ID</div>
                  <div className="font-mono text-lg">
                    {patient?.patient_no || 'Will be generated'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Patient's personal and demographic information
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
                        placeholder="Enter first name"
                      />
                      {errors.first_name && (
                        <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className={errors.last_name ? 'border-red-500' : ''}
                        placeholder="Enter last name"
                      />
                      {errors.last_name && (
                        <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        value={formData.middle_name}
                        onChange={(e) => handleInputChange('middle_name', e.target.value)}
                        placeholder="Enter middle name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="birthdate">Date of Birth *</Label>
                      <Input
                        id="birthdate"
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => handleInputChange('birthdate', e.target.value)}
                        className={errors.birthdate ? 'border-red-500' : ''}
                      />
                      {errors.birthdate && (
                        <p className="text-sm text-red-500 mt-1">{errors.birthdate}</p>
                      )}
                      {formData.birthdate && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Age: {calculateAge(formData.birthdate)} years old
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sex">Gender *</Label>
                      <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                        <SelectTrigger className={errors.sex ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sex && (
                        <p className="text-sm text-red-500 mt-1">{errors.sex}</p>
                      )}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        placeholder="e.g., Filipino"
                      />
                    </div>

                    <div>
                      <Label htmlFor="religion">Religion</Label>
                      <Input
                        id="religion"
                        value={formData.religion}
                        onChange={(e) => handleInputChange('religion', e.target.value)}
                        placeholder="e.g., Catholic"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
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
                        placeholder="+63 9XX XXX XXXX"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telephone_no">Telephone Number</Label>
                      <Input
                        id="telephone_no"
                        value={formData.telephone_no}
                        onChange={(e) => handleInputChange('telephone_no', e.target.value)}
                        placeholder="(XXX) XXX-XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="present_address">Present Address</Label>
                    <Textarea
                      id="present_address"
                      value={formData.present_address}
                      onChange={(e) => handleInputChange('present_address', e.target.value)}
                      placeholder="Complete address including street, barangay, city, province"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      placeholder="e.g., Teacher, Engineer, Business Owner"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                  <CardDescription>
                    Person to contact in case of emergency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="informant_name">Contact Person Name</Label>
                      <Input
                        id="informant_name"
                        value={formData.informant_name}
                        onChange={(e) => handleInputChange('informant_name', e.target.value)}
                        placeholder="Full name of emergency contact"
                      />
                    </div>

                    <div>
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        value={formData.relationship}
                        onChange={(e) => handleInputChange('relationship', e.target.value)}
                        placeholder="e.g., Spouse, Parent, Sibling"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Medical Information
                  </CardTitle>
                  <CardDescription>
                    Patient's medical background and allergies
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
                        placeholder="List any known drug allergies"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="food_allergies">Food Allergies</Label>
                      <Textarea
                        id="food_allergies"
                        value={formData.food_allergies}
                        onChange={(e) => handleInputChange('food_allergies', e.target.value)}
                        placeholder="List any known food allergies"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="past_medical_history">Past Medical History</Label>
                    <Textarea
                      id="past_medical_history"
                      value={formData.past_medical_history}
                      onChange={(e) => handleInputChange('past_medical_history', e.target.value)}
                      placeholder="Previous illnesses, surgeries, hospitalizations"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="family_history">Family History</Label>
                    <Textarea
                      id="family_history"
                      value={formData.family_history}
                      onChange={(e) => handleInputChange('family_history', e.target.value)}
                      placeholder="Family history of diseases or conditions"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="social_personal_history">Social/Personal History</Label>
                    <Textarea
                      id="social_personal_history"
                      value={formData.social_personal_history}
                      onChange={(e) => handleInputChange('social_personal_history', e.target.value)}
                      placeholder="Smoking, alcohol, lifestyle habits"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="obstetrics_gynecology_history">Obstetrics/Gynecology History</Label>
                    <Textarea
                      id="obstetrics_gynecology_history"
                      value={formData.obstetrics_gynecology_history}
                      onChange={(e) => handleInputChange('obstetrics_gynecology_history', e.target.value)}
                      placeholder="For female patients: pregnancies, deliveries, menstrual history"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                  <CardDescription>
                    Additional notes and special considerations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                    <p className="text-muted-foreground">
                      Additional patient information can be added here as needed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href={route('hospital.patients.index')}>
                  Cancel
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
                <User className="h-4 w-4 mr-2" />
                Basic Info
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveTab('contact')}>
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveTab('medical')}>
                <Activity className="h-4 w-4 mr-2" />
                Medical
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isEdit ? (
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Updating...' : 'Update Patient'}
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Patient'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
