import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Plus, TestTube, Trash2 } from 'lucide-react';
import * as React from 'react';

const buildBreadcrumbs = (patientId: number): BreadcrumbItem[] => [
    { title: 'Patient Management', href: '/admin/patient' },
    { title: 'Patient Details', href: `/admin/patient/${patientId}` },
];

interface PatientVisit {
    id: number;
    arrival_date: string;
    arrival_time: string;
    mode_of_arrival: string;
    attending_physician: string;
    reason_for_consult: string;
    assessment_diagnosis?: string;
    time_seen: string;
    status: 'active' | 'completed' | 'discharged';
    notes: string;
    visit_number: string;
    full_arrival_date_time: string;
    created_at: string;
    updated_at: string;
}

interface ShowPatientProps {
    patient: PatientItem;
    visits?: PatientVisit[];
    labOrders?: any[];
}

export default function ShowPatient({ patient, visits = [], labOrders = [] }: ShowPatientProps) {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const url = usePage().url as string;
    const activeTab = React.useMemo(() => {
        try {
            const qs = url.includes('?') ? url.split('?')[1] : '';
            const params = new URLSearchParams(qs);
            return params.get('tab') || 'details';
        } catch {
            return 'details';
        }
    }, [url]);
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '—';
        const match = String(timeString).match(/\d{2}:\d{2}/);
        const hhmm = match ? match[0] : timeString;
        return hhmm;
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
        <AppLayout breadcrumbs={buildBreadcrumbs(patient.id)}>
            <Head title={`Patient Details`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/admin/patient">
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
                            <Link href={`/admin/patient/${patient.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete patient?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-white hover:bg-red-700"
                                onClick={() => router.delete(`/admin/patient/${patient.id}`, { onSuccess: () => router.visit('/admin/patient') })}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Tabs defaultValue={activeTab}>
                    <TabsList>
                        <TabsTrigger value="details">Patient Details</TabsTrigger>
                        <TabsTrigger value="visits">Visit Records</TabsTrigger>
                        <TabsTrigger value="labs">Lab Orders</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6 pt-4">
                        <div className="grid gap-6 md:grid-cols-2">
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
                                            <p className="text-sm font-medium text-muted-foreground">Civil Status</p>
                                            <Badge variant={getCivilStatusBadgeVariant(patient.civil_status)}>
                                                {patient.civil_status.charAt(0).toUpperCase() + patient.civil_status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

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
                        </div>

                        {/* Medical History & Allergies */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Medical History & Allergies</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Drug Allergies</p>
                                        <p className="text-sm">{patient.drug_allergies || 'None reported'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Food Allergies</p>
                                        <p className="text-sm">{patient.food_allergies || 'None reported'}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Past Medical History</p>
                                    <p className="text-sm">{patient.past_medical_history || 'No past history recorded'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Family History</p>
                                    <p className="text-sm">{patient.family_history || 'No family history recorded'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Social/Personal History</p>
                                    <p className="text-sm">{patient.social_personal_history || 'No social history recorded'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Obstetrics & Gynecology History</p>
                                    <p className="text-sm">{patient.obstetrics_gynecology_history || 'No OB-GYN history recorded'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="visits" className="pt-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Visit Records</CardTitle>
                                    <Button onClick={() => router.visit(`/admin/patient/${patient.id}/visits/create`)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Visit
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {visits && visits.length > 0 ? (
                                    <div className="space-y-4">
                                        {visits.map((visit) => (
                                            <div key={visit.id} className="rounded-lg border p-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h4 className="font-semibold">{formatDate(visit.arrival_date)}</h4>
                                                    <Badge
                                                        variant={
                                                            visit.status === 'completed'
                                                                ? 'secondary'
                                                                : visit.status === 'active'
                                                                  ? 'default'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {visit.status}
                                                    </Badge>
                                                </div>
                                                <div className="mb-2 text-sm text-muted-foreground">
                                                    <p>
                                                        <strong>Attending Doctor:</strong> {visit.attending_physician}
                                                    </p>
                                                    {visit.assessment_diagnosis && (
                                                        <p>
                                                            <strong>Diagnosis:</strong> {visit.assessment_diagnosis}
                                                        </p>
                                                    )}
                                                    {visit.notes && (
                                                        <p>
                                                            <strong>Notes:</strong> {visit.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.visit(`/admin/patient/${patient.id}/visits/${visit.id}`)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold">No Visits Yet</h3>
                                        <p className="mb-4 text-muted-foreground">This patient hasn't had any visits recorded yet.</p>
                                        <Button onClick={() => router.visit(`/admin/patient/${patient.id}/visits/create`)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create First Visit
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="labs" className="pt-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Laboratory Orders</CardTitle>
                                    <Button onClick={() => router.visit(`/admin/laboratory/patients/${patient.id}/orders`)}>
                                        <TestTube className="mr-2 h-4 w-4" />
                                        Manage Lab Orders
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {labOrders && labOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {labOrders.map((order: any) => (
                                            <div key={order.id} className="rounded-lg border p-4">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h4 className="font-semibold">Order #{order.id}</h4>
                                                    <Badge
                                                        variant={
                                                            order.status === 'completed'
                                                                ? 'default'
                                                                : order.status === 'processing'
                                                                  ? 'secondary'
                                                                  : 'outline'
                                                        }
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                <div className="mb-2 text-sm text-muted-foreground">
                                                    <p>
                                                        <strong>Ordered by:</strong> {order.ordered_by?.name || 'Unknown'}
                                                    </p>
                                                    <p>
                                                        <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                    {order.notes && (
                                                        <p>
                                                            <strong>Notes:</strong> {order.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <p className="mb-1 text-sm font-medium">Tests Ordered:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {order.lab_tests?.map((test: any) => (
                                                            <Badge key={test.id} variant="outline" className="text-xs">
                                                                {test.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)}
                                                    >
                                                        Enter Results
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(`/admin/laboratory/orders/${order.id}/report`, '_blank')}
                                                    >
                                                        Generate Report
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <TestTube className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold">No Lab Orders Yet</h3>
                                        <p className="mb-4 text-muted-foreground">
                                            Create laboratory orders for this patient to track diagnostic tests and results.
                                        </p>
                                        <Button onClick={() => router.visit(`/admin/laboratory/patients/${patient.id}/orders`)}>
                                            <TestTube className="mr-2 h-4 w-4" />
                                            Create Lab Order
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

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
