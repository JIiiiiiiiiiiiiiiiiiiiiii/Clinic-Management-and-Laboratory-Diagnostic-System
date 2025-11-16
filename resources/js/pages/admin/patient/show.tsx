import PatientExportButton from '@/components/patient/PatientExportButton';
import { PatientActionButton, PatientInfoCard, PatientPageLayout } from '@/components/patient/PatientPageLayout';
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, router } from '@inertiajs/react';
import { Calendar, Edit, MapPin, Phone, Plus, Stethoscope, TestTube, User, Mail } from 'lucide-react';
import * as React from 'react';

const buildBreadcrumbs = (patientId: number): BreadcrumbItem[] => [
    { title: 'Patient Management', href: '/admin/patient' },
    { title: 'Patient Details', href: `/admin/patient/${patientId}` },
];

interface ShowPatientProps {
    patient: PatientItem;
    labOrders?: any[];
}

export default function ShowPatient({ patient, labOrders = [] }: ShowPatientProps) {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('details');

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = () => {
        router.delete(`/admin/patient/${patient.id}`, {
            onSuccess: () => {
                router.visit('/admin/patient');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={buildBreadcrumbs(patient.id)}>
            <Head title={`Patient Details - ${patient.first_name} ${patient.last_name}`} />
            <PatientPageLayout
                title={`${patient.first_name} ${patient.last_name}`}
                description={`Patient No: ${patient.patient_no || 'N/A'}`}
                icon={<User className="h-6 w-6" />}
                actions={
                    <div className="flex items-center gap-4">
                        <PatientExportButton patientId={patient.id} patientName={`${patient.first_name} ${patient.last_name}`} />
                        <PatientActionButton
                            variant="default"
                            icon={<Edit className="h-4 w-4" />}
                            label="Edit Patient"
                            href={`/admin/patient/${patient.id}/edit`}
                        />
                    </div>
                }
            >
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <p className="text-sm text-gray-600">Are you sure you want to delete this patient? This action cannot be undone.</p>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Patient Details Section */}
                <PatientInfoCard title="Patient Information" icon={<User className="h-5 w-5 text-black" />} className="mb-8">
                    <Tabs defaultValue={activeTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Patient Details</TabsTrigger>
                            <TabsTrigger value="labs">Lab Orders</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6 pt-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Patient Identification */}
                                <Card className="shadow-sm">
                                    <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <User className="h-5 w-5 text-black" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">Patient Identification</h4>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Full Name</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {patient.first_name} {patient.middle_name} {patient.last_name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Patient Number</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.patient_no || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Birth Date</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {patient.birthdate ? new Date(patient.birthdate).toLocaleDateString() : 'Not provided'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Sex</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.sex || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Civil Status</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.civil_status || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Nationality</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.nationality || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Contact Information */}
                                <Card className="shadow-sm">
                                    <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <Phone className="h-5 w-5 text-black" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div>
                                            <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                Present Address
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">{patient.present_address || 'Not provided'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                    <Phone className="h-4 w-4" />
                                                    Telephone Number
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">{patient.telephone_no || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                    <Phone className="h-4 w-4" />
                                                    Mobile Number
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">{patient.mobile_no || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                <Mail className="h-4 w-4" />
                                                Email Address
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">{patient.email || 'Not provided'}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Demographics */}
                                <Card className="shadow-sm">
                                    <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <User className="h-5 w-5 text-black" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">Demographics</h4>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Occupation</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.occupation || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Religion</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.religion || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Emergency Contact */}
                                <Card className="shadow-sm">
                                    <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <Phone className="h-5 w-5 text-black" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">Emergency Contact</h4>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Informant Name</p>
                                                <p className="text-sm font-bold text-black">{patient.emergency_name || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Relationship</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.emergency_relation || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Medical History & Allergies */}
                            <Card className="shadow-sm">
                                <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
                                    <div className="rounded-lg bg-gray-100 p-2">
                                        <Stethoscope className="h-5 w-5 text-black" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900">Medical History & Allergies</h4>
                                </div>
                                <CardContent className="space-y-6 p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Drug Allergies</p>
                                            <p className="text-sm font-semibold text-gray-900">{patient.drug_allergies || 'None reported'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Food Allergies</p>
                                            <p className="text-sm font-semibold text-gray-900">{patient.food_allergies || 'None reported'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Past Medical History</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {patient.past_medical_history || 'No past medical history recorded'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Family History</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {patient.family_history || 'No family history recorded'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">OB-GYN History</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {patient.obstetrics_gynecology_history || 'No OB-GYN history recorded'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>


                        <TabsContent value="labs" className="pt-4">
                            <Card className="shadow-sm">
                                <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <TestTube className="h-5 w-5 text-black" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">Laboratory Orders</h4>
                                    </div>
                                    <Button onClick={() => router.visit(`/admin/laboratory/patients/${patient.id}/orders`)} className="bg-green-600 hover:bg-green-700 text-white">
                                        <TestTube className="mr-2 h-4 w-4" />
                                        Manage Lab Orders
                                    </Button>
                                </div>
                                <CardContent className="p-6 pt-8">
                                    {labOrders && labOrders.length > 0 ? (
                                        <div className="space-y-4">
                                            {labOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="rounded-lg bg-gray-100 p-2">
                                                                <TestTube className="h-4 w-4 text-black" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-gray-900">Lab Order #{order.id}</h5>
                                                                <p className="text-sm text-gray-600">{order.test_name || 'Laboratory Test'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                                                {order.status}
                                                            </Badge>
                                                            <div className="flex gap-2">
                                                                <Button onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)} className="bg-green-600 hover:bg-green-700 text-white">
                                                                    Enter Results
                                                                </Button>
                                                                <Button
                                                                    onClick={() =>
                                                                        window.open(`/admin/laboratory/orders/${order.id}/report`, '_blank')
                                                                    }
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    Generate Report
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <TestTube className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Lab Orders Yet</h3>
                                            <p className="mb-4 text-gray-600">
                                                Create laboratory orders for this patient to track diagnostic tests and results.
                                            </p>
                                            <Button onClick={() => router.visit(`/admin/laboratory/patients/${patient.id}/orders`)} className="bg-green-600 hover:bg-green-700 text-white">
                                                <TestTube className="mr-2 h-4 w-4" />
                                                Create Lab Order
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </PatientInfoCard>
            </PatientPageLayout>
        </AppLayout>
    );
}
