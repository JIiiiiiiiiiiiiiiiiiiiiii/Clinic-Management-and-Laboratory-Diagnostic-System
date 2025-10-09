import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  Activity,
  ArrowRightLeft
} from 'lucide-react';

interface Patient {
  id: number;
  patient_no: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  birthdate: string;
  age: number;
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
  created_at: string;
  transfers?: any[];
  visits?: any[];
  appointments?: any[];
}

interface Props {
  patient: Patient;
}

export default function HospitalPatientShow({ patient }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Patients', href: route('hospital.patients.index') },
    { label: patient.full_name, href: route('hospital.patients.show', patient.id) },
  ];

  const getSexColor = (sex: string) => {
    return sex === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${patient.full_name} - Hospital`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{patient.full_name}</h1>
            <p className="text-muted-foreground">
              Patient #{patient.patient_no} • {patient.age} years old
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={route('hospital.patients.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Link>
            </Button>
            <Button asChild>
              <Link href={route('hospital.patients.edit', patient.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Link>
            </Button>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Patient Number</label>
                <p className="text-lg font-semibold">{patient.patient_no}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-lg">{patient.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p className="text-lg">{new Date(patient.birthdate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p className="text-lg">{patient.age} years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sex</label>
                <Badge className={getSexColor(patient.sex)}>
                  {patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.mobile_no && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                  <p className="text-lg">{patient.mobile_no}</p>
                </div>
              )}
              {patient.telephone_no && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telephone</label>
                  <p className="text-lg">{patient.telephone_no}</p>
                </div>
              )}
              {patient.present_address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-lg">{patient.present_address}</p>
                </div>
              )}
              {patient.occupation && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                  <p className="text-lg">{patient.occupation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.civil_status && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Civil Status</label>
                  <p className="text-lg">{patient.civil_status}</p>
                </div>
              )}
              {patient.nationality && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                  <p className="text-lg">{patient.nationality}</p>
                </div>
              )}
              {patient.religion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Religion</label>
                  <p className="text-lg">{patient.religion}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                <p className="text-lg">{new Date(patient.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Information */}
        {(patient.drug_allergies || patient.food_allergies || patient.past_medical_history || 
          patient.family_history || patient.social_personal_history || patient.obstetrics_gynecology_history) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.drug_allergies && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Drug Allergies</label>
                  <p className="text-lg">{patient.drug_allergies}</p>
                </div>
              )}
              {patient.food_allergies && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Food Allergies</label>
                  <p className="text-lg">{patient.food_allergies}</p>
                </div>
              )}
              {patient.past_medical_history && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Past Medical History</label>
                  <p className="text-lg">{patient.past_medical_history}</p>
                </div>
              )}
              {patient.family_history && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Family History</label>
                  <p className="text-lg">{patient.family_history}</p>
                </div>
              )}
              {patient.social_personal_history && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Social/Personal History</label>
                  <p className="text-lg">{patient.social_personal_history}</p>
                </div>
              )}
              {patient.obstetrics_gynecology_history && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Obstetrics/Gynecology History</label>
                  <p className="text-lg">{patient.obstetrics_gynecology_history}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transfers */}
        {patient.transfers && patient.transfers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Transfer History
              </CardTitle>
              <CardDescription>
                Patient transfer records and history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.transfers.map((transfer, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(transfer.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{transfer.from_hospital ? 'Hospital' : 'Clinic'}</TableCell>
                      <TableCell>{transfer.to_clinic || 'Hospital'}</TableCell>
                      <TableCell>
                        <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{transfer.transfer_reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common actions for this patient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href={route('hospital.patients.transfer', patient.id)}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transfer to Clinic
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={route('hospital.patients.transfer.history', patient.id)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  View Transfer History
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
