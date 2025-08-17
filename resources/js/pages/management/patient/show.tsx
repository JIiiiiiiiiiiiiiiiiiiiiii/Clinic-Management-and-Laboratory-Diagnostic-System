import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/management/patient',
    },
    {
        title: 'Patient Details',
        href: '/management/patient/show',
    },
];

interface ShowPatientProps {
    patient: PatientItem;
}

export default function ShowPatient({ patient }: ShowPatientProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getSexBadgeVariant = (sex: string) => {
        switch (sex) {
            case 'male':
                return 'default';
            case 'female':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const getCivilStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'single':
                return 'outline';
            case 'married':
                return 'default';
            case 'widowed':
                return 'secondary';
            case 'divorced':
                return 'destructive';
            case 'separated':
                return 'outline';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Patient Details`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/management/patient">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {patient.first_name} {patient.last_name}
                            </h1>
                            <p className="text-muted-foreground">Patient No: {patient.patient_no}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/management/patient/${patient.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Arrival Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Arrival Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Arrival Date</p>
                                    <p className="text-sm">{formatDate(patient.arrival_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Arrival Time</p>
                                    <p className="text-sm">{formatTime(patient.arrival_time)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patient Identification */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Identification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                    <p className="text-sm">
                                        {patient.last_name}, {patient.first_name} {patient.middle_name || ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Patient No.</p>
                                    <p className="text-sm font-medium">{patient.patient_no}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Birthdate</p>
                                    <p className="text-sm">{formatDate(patient.birthdate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                                    <p className="text-sm">{patient.age} years</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sex</p>
                                    <Badge variant={getSexBadgeVariant(patient.sex)}>
                                        {patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                                    <p className="text-sm">{patient.nationality}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Demographics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Demographics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                                    <p className="text-sm">{patient.occupation || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Religion</p>
                                    <p className="text-sm">{patient.religion || 'Not provided'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Attending Physician</p>
                                    <p className="text-sm font-medium">{patient.attending_physician}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Civil Status</p>
                                    <Badge variant={getCivilStatusBadgeVariant(patient.civil_status)}>
                                        {patient.civil_status.charAt(0).toUpperCase() + patient.civil_status.slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Present Address</p>
                                <p className="text-sm">{patient.present_address}</p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Telephone No.</p>
                                    <p className="text-sm">{patient.telephone_no || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Mobile No.</p>
                                    <p className="text-sm font-medium">{patient.mobile_no}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Informant Name</p>
                                    <p className="text-sm font-medium">{patient.informant_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                                    <p className="text-sm">{patient.relationship}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial/Insurance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial/Insurance Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                                    <p className="text-sm">{patient.company_name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">HMO Name</p>
                                    <p className="text-sm">{patient.hmo_name || 'Not provided'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">HMO/Company ID No.</p>
                                    <p className="text-sm">{patient.hmo_company_id_no || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Validation/Approval Code</p>
                                    <p className="text-sm">{patient.validation_approval_code || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Validity</p>
                                    <p className="text-sm">{patient.validity || 'Not provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Emergency Staff Nurse Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Emergency Staff Nurse Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Mode of Arrival</p>
                                <p className="text-sm font-medium">{patient.mode_of_arrival}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Drug Allergies</p>
                                <p className="text-sm">{patient.drug_allergies}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Food Allergies</p>
                                <p className="text-sm">{patient.food_allergies}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vital Signs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Initial Vital Signs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Blood Pressure</p>
                                <p className="text-sm">{patient.blood_pressure || 'Not recorded'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Heart Rate</p>
                                <p className="text-sm">{patient.heart_rate || 'Not recorded'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Respiratory Rate</p>
                                <p className="text-sm">{patient.respiratory_rate || 'Not recorded'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                                <p className="text-sm">{patient.temperature || 'Not recorded'}</p>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Weight (kg)</p>
                                <p className="text-sm">{patient.weight_kg || 'Not recorded'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Height (cm)</p>
                                <p className="text-sm">{patient.height_cm || 'Not recorded'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pain Assessment Scale</p>
                                <p className="text-sm">{patient.pain_assessment_scale || 'Not recorded'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">O2 Saturation</p>
                                <p className="text-sm">{patient.oxygen_saturation || 'Not recorded'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Assessment */}
                <Card>
                    <CardHeader>
                        <CardTitle>Medical Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Reason for Consult</p>
                                <p className="text-sm font-medium">{patient.reason_for_consult}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Time Seen</p>
                                <p className="text-sm">{formatTime(patient.time_seen)}</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">History of Present Illness</p>
                            <p className="text-sm">{patient.history_of_present_illness || 'No history recorded'}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pertinent Physical Findings</p>
                            <p className="text-sm">{patient.pertinent_physical_findings || 'No findings recorded'}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Plan/Management</p>
                            <p className="text-sm">{patient.plan_management || 'No plan recorded'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Past Medical History</p>
                                <p className="text-sm">{patient.past_medical_history || 'No past history recorded'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Family History</p>
                                <p className="text-sm">{patient.family_history || 'No family history recorded'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Social/Personal History</p>
                            <p className="text-sm">{patient.social_personal_history || 'No social history recorded'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Obstetrics & Gynecology History</p>
                                <p className="text-sm">{patient.obstetrics_gynecology_history || 'No OB-GYN history recorded'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Menstrual Period (LMP)</p>
                                <p className="text-sm">{patient.lmp || 'Not recorded'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Assessment/Diagnosis</p>
                            <p className="text-sm">{patient.assessment_diagnosis || 'No assessment recorded'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-muted-foreground">Created</p>
                                <p>{formatDate(patient.created_at)}</p>
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">Last Updated</p>
                                <p>{formatDate(patient.updated_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
