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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, router } from '@inertiajs/react';
import { Calendar, Edit, MapPin, Phone, Plus, Stethoscope, TestTube, User, Mail, Clock, FileText, Eye, ExternalLink, Heart, Activity, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import * as React from 'react';

const buildBreadcrumbs = (patientId: number): BreadcrumbItem[] => [
    { title: 'Patient Management', href: '/admin/patient' },
    { title: 'Patient Details', href: `/admin/patient/${patientId}` },
];

interface ShowPatientProps {
    patient: PatientItem;
    labOrders?: any[];
    visits?: any[];
}

export default function ShowPatient({ patient, labOrders = [], visits = [] }: ShowPatientProps) {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('details');
    const [selectedVisit, setSelectedVisit] = React.useState<any>(null);
    const [visitModalOpen, setVisitModalOpen] = React.useState(false);
    const [selectedLabOrder, setSelectedLabOrder] = React.useState<any>(null);
    const [labOrderModalOpen, setLabOrderModalOpen] = React.useState(false);

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

    const openVisitModal = (visit: any) => {
        setSelectedVisit(visit);
        setVisitModalOpen(true);
    };

    const openLabOrderModal = (order: any) => {
        setSelectedLabOrder(order);
        setLabOrderModalOpen(true);
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
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Patient Details</TabsTrigger>
                            <TabsTrigger value="visits">Visits</TabsTrigger>
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

                                {/* Financial/Insurance Information */}
                                <Card className="shadow-sm md:col-span-2">
                                    <div className="flex items-center gap-3 border-b bg-gray-50 p-4">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <Shield className="h-5 w-5 text-black" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">Financial/Insurance Information</h4>
                                    </div>
                                    <CardContent className="space-y-4 p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Company Name</p>
                                                <p className="text-sm font-semibold text-gray-900">{(patient as any).insurance_company || patient.company_name || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">HMO Name</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.hmo_name || (patient as any).hmo_name || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">HMO Company ID No</p>
                                                <p className="text-sm font-semibold text-gray-900">{(patient as any).hmo_id_no || patient.hmo_company_id_no || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Validation Approval Code</p>
                                                <p className="text-sm font-semibold text-gray-900">{(patient as any).approval_code || patient.validation_approval_code || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Validity</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {(() => {
                                                        const validityValue = patient.validity || (patient as any).validity;
                                                        if (!validityValue) return 'Not provided';
                                                        if (typeof validityValue === 'string' && (validityValue.includes('-') || validityValue.includes('/'))) {
                                                            try {
                                                                return new Date(validityValue).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                });
                                                            } catch {
                                                                return validityValue;
                                                            }
                                                        }
                                                        return validityValue;
                                                    })()}
                                                </p>
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

                        <TabsContent value="visits" className="pt-4">
                            <Card className="shadow-sm">
                                <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <Calendar className="h-5 w-5 text-black" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900">Patient Visits</h4>
                                        <Badge variant="secondary" className="ml-2">
                                            {visits?.length || 0} {visits?.length === 1 ? 'visit' : 'visits'}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-6 pt-8">
                                    {visits && visits.length > 0 ? (
                                        <div className="space-y-4">
                                            {visits.map((visit) => (
                                                <div
                                                    key={visit.id}
                                                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md cursor-pointer"
                                                    onClick={() => openVisitModal(visit)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="mb-3 flex items-center gap-3">
                                                                <div className="rounded-lg bg-gray-100 p-2">
                                                                    <Calendar className="h-4 w-4 text-black" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="font-semibold text-gray-900">
                                                                            Visit {visit.visit_code || `#${visit.id}`}
                                                                        </h5>
                                                                        <Badge 
                                                                            variant={
                                                                                visit.status === 'completed' ? 'default' : 
                                                                                visit.status === 'cancelled' ? 'destructive' : 
                                                                                'secondary'
                                                                            }
                                                                            className="text-xs"
                                                                        >
                                                                            {visit.status || 'pending'}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {visit.visit_date_time_time 
                                                                            ? new Date(visit.visit_date_time_time).toLocaleString('en-US', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })
                                                                            : visit.visit_date_time
                                                                            ? new Date(visit.visit_date_time).toLocaleString('en-US', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })
                                                                            : 'Date not available'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="ml-11 space-y-2">
                                                                {/* Vital Signs Summary */}
                                                                {(visit.blood_pressure || visit.heart_rate || visit.temperature || visit.respiratory_rate) && (
                                                                    <div className="flex flex-wrap gap-3 text-xs bg-blue-50 p-2 rounded border border-blue-100">
                                                                        {visit.blood_pressure && (
                                                                            <div className="flex items-center gap-1">
                                                                                <Heart className="h-3 w-3 text-blue-600" />
                                                                                <span className="text-gray-600">BP:</span>
                                                                                <span className="font-semibold text-gray-900">{visit.blood_pressure}</span>
                                                                            </div>
                                                                        )}
                                                                        {visit.heart_rate && (
                                                                            <div className="flex items-center gap-1">
                                                                                <Activity className="h-3 w-3 text-red-600" />
                                                                                <span className="text-gray-600">HR:</span>
                                                                                <span className="font-semibold text-gray-900">{visit.heart_rate} bpm</span>
                                                                            </div>
                                                                        )}
                                                                        {visit.temperature && (
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="text-gray-600">Temp:</span>
                                                                                <span className="font-semibold text-gray-900">{visit.temperature}°C</span>
                                                                            </div>
                                                                        )}
                                                                        {visit.respiratory_rate && (
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="text-gray-600">RR:</span>
                                                                                <span className="font-semibold text-gray-900">{visit.respiratory_rate}/min</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    {visit.attendingStaff && (
                                                                        <div>
                                                                            <p className="text-gray-600">Attending Staff:</p>
                                                                            <p className="font-semibold text-gray-900">{visit.attendingStaff.name || 'N/A'}</p>
                                                                        </div>
                                                                    )}
                                                                    {visit.visit_type && (
                                                                        <div>
                                                                            <p className="text-gray-600">Visit Type:</p>
                                                                            <p className="font-semibold text-gray-900">{visit.visit_type}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {visit.reason_for_consult && (
                                                                    <div className="text-sm">
                                                                        <p className="text-gray-600">Chief Complaint:</p>
                                                                        <p className="font-semibold text-gray-900 line-clamp-1">{visit.reason_for_consult}</p>
                                                                    </div>
                                                                )}
                                                                {visit.assessment_diagnosis && (
                                                                    <div className="text-sm">
                                                                        <p className="text-gray-600">Diagnosis:</p>
                                                                        <p className="font-semibold text-gray-900 line-clamp-1">{visit.assessment_diagnosis}</p>
                                                                    </div>
                                                                )}
                                                                {visit.plan_management && (
                                                                    <div className="text-sm">
                                                                        <p className="text-gray-600">Plan:</p>
                                                                        <p className="font-semibold text-gray-900 line-clamp-1">{visit.plan_management}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-2 ml-4">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openVisitModal(visit);
                                                                }}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Visits Recorded</h3>
                                            <p className="mb-4 text-gray-600">
                                                This patient has no visit records yet. Visits will appear here once they are created.
                                            </p>
                                        </div>
                                    )}
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
                                        <Badge variant="secondary" className="ml-2">
                                            {labOrders?.length || 0} {labOrders?.length === 1 ? 'order' : 'orders'}
                                        </Badge>
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
                                                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md cursor-pointer"
                                                    onClick={() => openLabOrderModal(order)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="mb-3 flex items-center gap-3">
                                                            <div className="rounded-lg bg-gray-100 p-2">
                                                                <TestTube className="h-4 w-4 text-black" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h5 className="font-semibold text-gray-900">
                                                                            Lab Order #{order.id}
                                                                        </h5>
                                                                        <Badge 
                                                                            variant={
                                                                                order.status === 'completed' ? 'default' : 
                                                                                order.status === 'cancelled' ? 'destructive' : 
                                                                                order.status === 'processing' ? 'secondary' :
                                                                                'secondary'
                                                                            }
                                                                            className="text-xs"
                                                                        >
                                                                            {order.status || 'ordered'}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {order.created_at 
                                                                            ? new Date(order.created_at).toLocaleString('en-US', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })
                                                                            : 'Date not available'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="ml-11 space-y-2">
                                                                {/* Results Status Summary */}
                                                                {(() => {
                                                                    const results = order.results || [];
                                                                    const totalResults = results.length;
                                                                    const resultsWithValues = results.filter((r: any) => r.values && r.values.length > 0).length;
                                                                    const verifiedResults = results.filter((r: any) => r.verified_at).length;
                                                                    // Check for abnormal results - look at result values or check if any values indicate abnormal
                                                                    const hasAbnormalResults = results.some((r: any) => {
                                                                        if (!r.values || r.values.length === 0) return false;
                                                                        // Check if any value has abnormal status or if we can determine from ranges
                                                                        return r.values.some((v: any) => {
                                                                            // Check explicit status field
                                                                            if (v.status === 'Abnormal' || v.status === 'abnormal') return true;
                                                                            // Could also check if value is outside normal range if we have that data
                                                                            return false;
                                                                        });
                                                                    });
                                                                    const daysSinceOrdered = order.created_at 
                                                                        ? Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))
                                                                        : null;
                                                                    
                                                                    // Only show summary if there's meaningful data
                                                                    if (totalResults === 0 && !hasAbnormalResults) return null;
                                                                    
                                                                    return (
                                                                        <div className="flex flex-wrap gap-3 text-xs bg-green-50 p-2 rounded border border-green-100">
                                                                            {totalResults > 0 && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <TestTube className="h-3 w-3 text-green-600" />
                                                                                    <span className="text-gray-600">Tests:</span>
                                                                                    <span className="font-semibold text-gray-900">{totalResults}</span>
                                                                                </div>
                                                                            )}
                                                                            {resultsWithValues > 0 && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                                                                                    <span className="text-gray-600">Results:</span>
                                                                                    <span className="font-semibold text-gray-900">{resultsWithValues}/{totalResults}</span>
                                                                                </div>
                                                                            )}
                                                                            {verifiedResults > 0 && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                                    <span className="text-gray-600">Verified:</span>
                                                                                    <span className="font-semibold text-gray-900">{verifiedResults}</span>
                                                                                </div>
                                                                            )}
                                                                            {hasAbnormalResults && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                                                                    <span className="font-semibold text-red-600">Abnormal Results</span>
                                                                                </div>
                                                                            )}
                                                                            {daysSinceOrdered !== null && daysSinceOrdered > 0 && resultsWithValues === 0 && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Clock className="h-3 w-3 text-orange-600" />
                                                                                    <span className="text-orange-600 font-semibold">Pending for {daysSinceOrdered} day{daysSinceOrdered !== 1 ? 's' : ''}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    {order.orderedBy && (
                                                                        <div>
                                                                            <p className="text-gray-600">Ordered By:</p>
                                                                            <p className="font-semibold text-gray-900">{order.orderedBy.name || 'N/A'}</p>
                                                                        </div>
                                                                    )}
                                                                    {order.updated_at && (
                                                            <div>
                                                                            <p className="text-gray-600">Last Updated:</p>
                                                                            <p className="font-semibold text-gray-900">
                                                                                {new Date(order.updated_at).toLocaleString('en-US', {
                                                                                    year: 'numeric',
                                                                                    month: 'short',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                })}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {order.lab_tests && order.lab_tests.length > 0 && (
                                                                    <div className="text-sm">
                                                                        <p className="text-gray-600 mb-1">Tests ({order.lab_tests.length}):</p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {order.lab_tests.slice(0, 4).map((test: any) => (
                                                                                <Badge key={test.id} variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                                                                    {test.name || test.code}
                                                                                </Badge>
                                                                            ))}
                                                                            {order.lab_tests.length > 4 && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    +{order.lab_tests.length - 4} more
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-2 ml-4">
                                                            <div className="flex flex-col gap-2">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openLabOrderModal(order);
                                                                    }}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Details
                                                                </Button>
                                                                {order.status !== 'completed' && (
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            router.visit(`/admin/laboratory/orders/${order.id}/results`);
                                                                        }}
                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                    >
                                                                        <TestTube className="mr-2 h-4 w-4" />
                                                                        Results
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`/admin/laboratory/orders/${order.id}/report`, '_blank');
                                                                    }}
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                    Report
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

                {/* Visit Details Modal */}
                <Dialog open={visitModalOpen} onOpenChange={setVisitModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Visit {selectedVisit?.visit_code || `#${selectedVisit?.id}`}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedVisit?.visit_date_time_time 
                                    ? new Date(selectedVisit.visit_date_time_time).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : selectedVisit?.visit_date_time
                                    ? new Date(selectedVisit.visit_date_time).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : 'Date not available'}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedVisit && (
                            <div className="space-y-4 py-4">
                                {/* Visit Status Summary */}
                                {(() => {
                                    const visitDate = selectedVisit.visit_date_time_time || selectedVisit.visit_date_time;
                                    const isCompleted = selectedVisit.status === 'completed';
                                    const isScheduled = selectedVisit.status === 'scheduled' || selectedVisit.status === 'pending';
                                    const hasVitalSigns = selectedVisit.blood_pressure || selectedVisit.heart_rate || selectedVisit.temperature;
                                    const hasClinicalData = selectedVisit.reason_for_consult || selectedVisit.assessment_diagnosis || selectedVisit.plan_management;
                                    
                                    return (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                Visit Status
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-600">Status</p>
                                                    <Badge 
                                                        variant={
                                                            isCompleted ? 'default' : 
                                                            selectedVisit.status === 'cancelled' ? 'destructive' : 
                                                            'secondary'
                                                        }
                                                        className="mt-1"
                                                    >
                                                        {selectedVisit.status || 'pending'}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Vital Signs</p>
                                                    <p className={`text-sm font-bold ${hasVitalSigns ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {hasVitalSigns ? 'Recorded' : 'Not Recorded'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Clinical Data</p>
                                                    <p className={`text-sm font-bold ${hasClinicalData ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {hasClinicalData ? 'Available' : 'Not Available'}
                                                    </p>
                                                </div>
                                                {selectedVisit.visit_type && (
                                                    <div>
                                                        <p className="text-xs text-gray-600">Visit Type</p>
                                                        <p className="text-sm font-bold text-gray-900 capitalize">{selectedVisit.visit_type}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Vital Signs - Prominent Display */}
                                {(selectedVisit.blood_pressure || selectedVisit.heart_rate || selectedVisit.temperature || selectedVisit.respiratory_rate || selectedVisit.oxygen_saturation || selectedVisit.weight_kg || selectedVisit.height_cm) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-600" />
                                            Vital Signs
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {selectedVisit.blood_pressure && (
                                                <div>
                                                    <p className="text-xs text-gray-600">Blood Pressure</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedVisit.blood_pressure}</p>
                                                </div>
                                            )}
                                            {selectedVisit.heart_rate && (
                                                <div>
                                                    <p className="text-xs text-gray-600">Heart Rate</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedVisit.heart_rate} bpm</p>
                                                </div>
                                            )}
                                            {selectedVisit.temperature && (
                                                <div>
                                                    <p className="text-xs text-gray-600">Temperature</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedVisit.temperature}°C</p>
                                                </div>
                                            )}
                                            {selectedVisit.respiratory_rate && (
                                                <div>
                                                    <p className="text-xs text-gray-600">Respiratory Rate</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedVisit.respiratory_rate}/min</p>
                                                </div>
                                            )}
                                            {selectedVisit.oxygen_saturation && (
                                                <div>
                                                    <p className="text-xs text-gray-600">O2 Saturation</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedVisit.oxygen_saturation}%</p>
                                                </div>
                                            )}
                                            {(selectedVisit.weight_kg || selectedVisit.height_cm) && (
                                                <div>
                                                    <p className="text-xs text-gray-600">Weight / Height</p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {selectedVisit.weight_kg ? `${selectedVisit.weight_kg} kg` : ''}
                                                        {selectedVisit.weight_kg && selectedVisit.height_cm ? ' / ' : ''}
                                                        {selectedVisit.height_cm ? `${selectedVisit.height_cm} cm` : ''}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedVisit.pain_assessment_scale && (
                                                <div>
                                                    <p className="text-xs text-gray-600">Pain Scale</p>
                                                    <p className="text-sm font-bold text-gray-900">{selectedVisit.pain_assessment_scale}/10</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Clinical Assessment */}
                                <div className="space-y-3">
                                    {selectedVisit.reason_for_consult && (
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                            <p className="text-xs font-semibold text-yellow-800 mb-1">Chief Complaint</p>
                                            <p className="text-sm text-gray-900">{selectedVisit.reason_for_consult}</p>
                                        </div>
                                    )}
                                    {selectedVisit.assessment_diagnosis && (
                                        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                                            <p className="text-xs font-semibold text-red-800 mb-1">Diagnosis</p>
                                            <p className="text-sm text-gray-900 font-medium">{selectedVisit.assessment_diagnosis}</p>
                                        </div>
                                    )}
                                    {selectedVisit.plan_management && (
                                        <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                                            <p className="text-xs font-semibold text-green-800 mb-1">Treatment Plan</p>
                                            <p className="text-sm text-gray-900">{selectedVisit.plan_management}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Visit Information */}
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                    {selectedVisit.attendingStaff && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">Attending Staff</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">{selectedVisit.attendingStaff.name || 'N/A'}</p>
                                        </div>
                                    )}
                                    {selectedVisit.visit_code && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">Visit Code</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">{selectedVisit.visit_code}</p>
                                        </div>
                                    )}
                                    {selectedVisit.arrival_date && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">Arrival Date</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {new Date(selectedVisit.arrival_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {selectedVisit.mode_of_arrival && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">Mode of Arrival</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">{selectedVisit.mode_of_arrival}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Detailed Clinical Notes */}
                                {(selectedVisit.history_of_present_illness || selectedVisit.pertinent_physical_findings || selectedVisit.notes) && (
                                    <div className="border-t pt-4 space-y-3">
                                        {selectedVisit.history_of_present_illness && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700 mb-1">History of Present Illness</p>
                                                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedVisit.history_of_present_illness}</p>
                                            </div>
                                        )}
                                        {selectedVisit.pertinent_physical_findings && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700 mb-1">Physical Findings</p>
                                                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedVisit.pertinent_physical_findings}</p>
                                            </div>
                                        )}
                                        {selectedVisit.notes && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700 mb-1">Additional Notes</p>
                                                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedVisit.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setVisitModalOpen(false)}
                            >
                                Close
                            </Button>
                            {selectedVisit?.id && (
                                <Button
                                    onClick={() => {
                                        setVisitModalOpen(false);
                                        router.visit(`/admin/visits/${selectedVisit.id}`);
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Full Details
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Lab Order Details Modal */}
                <Dialog open={labOrderModalOpen} onOpenChange={setLabOrderModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <TestTube className="h-5 w-5" />
                                Lab Order #{selectedLabOrder?.id}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedLabOrder?.created_at 
                                    ? new Date(selectedLabOrder.created_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : 'Date not available'}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedLabOrder && (
                            <div className="space-y-4 py-4">
                                {/* Results Summary - Quick Status */}
                                {(() => {
                                    const results = selectedLabOrder.results || [];
                                    const totalResults = results.length;
                                    const resultsWithValues = results.filter((r: any) => r.values && r.values.length > 0).length;
                                    const verifiedResults = results.filter((r: any) => r.verified_at).length;
                                    const abnormalResults = results.filter((r: any) => {
                                        if (!r.values || r.values.length === 0) return false;
                                        return r.values.some((v: any) => v.status === 'Abnormal' || v.status === 'abnormal');
                                    });
                                    
                                    if (totalResults === 0) return null;
                                    
                                    return (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <TestTube className="h-4 w-4 text-blue-600" />
                                                Results Status
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-600">Total Tests</p>
                                                    <p className="text-lg font-bold text-gray-900">{totalResults}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Results Entered</p>
                                                    <p className="text-lg font-bold text-blue-600">{resultsWithValues}/{totalResults}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Verified</p>
                                                    <p className={`text-lg font-bold ${verifiedResults > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {verifiedResults > 0 ? 'Yes' : 'No'}
                                                    </p>
                                                </div>
                                                {abnormalResults.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-600">Abnormal</p>
                                                        <p className="text-lg font-bold text-red-600 flex items-center gap-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {abnormalResults.length}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Test Results Preview */}
                                {selectedLabOrder.results && selectedLabOrder.results.length > 0 && (() => {
                                    const resultsWithValues = selectedLabOrder.results.filter((r: any) => r.values && r.values.length > 0);
                                    if (resultsWithValues.length === 0) return null;
                                    
                                    return (
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-2 border-b">
                                                <h4 className="text-sm font-semibold text-gray-900">Test Results Preview</h4>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {resultsWithValues.slice(0, 3).map((result: any) => (
                                                    <div key={result.id} className="border-b last:border-b-0 p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {result.test?.name || result.test?.code || 'Unknown Test'}
                                                            </p>
                                                            {result.verified_at && (
                                                                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                                                    Verified
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            {result.values.slice(0, 3).map((value: any, idx: number) => (
                                                                <div key={idx} className="flex items-center justify-between text-xs">
                                                                    <span className="text-gray-600">
                                                                        {value.parameter_label || value.parameter_key || 'Parameter'}:
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold text-gray-900">
                                                                            {value.value} {value.unit ? value.unit : ''}
                                                                        </span>
                                                                        {value.status && (
                                                                            <Badge 
                                                                                variant={value.status === 'Abnormal' || value.status === 'abnormal' ? 'destructive' : 'default'}
                                                                                className="text-xs"
                                                                            >
                                                                                {value.status}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {result.values.length > 3 && (
                                                                <p className="text-xs text-gray-500 italic">
                                                                    +{result.values.length - 3} more parameters
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {resultsWithValues.length > 3 && (
                                                    <div className="p-3 text-center text-xs text-gray-500 border-t">
                                                        +{resultsWithValues.length - 3} more test{resultsWithValues.length - 3 !== 1 ? 's' : ''} with results
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Order Information */}
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                    <div>
                                        <p className="text-xs font-medium text-gray-600">Status</p>
                                        <Badge 
                                            variant={
                                                selectedLabOrder.status === 'completed' ? 'default' : 
                                                selectedLabOrder.status === 'cancelled' ? 'destructive' : 
                                                selectedLabOrder.status === 'processing' ? 'secondary' :
                                                'secondary'
                                            }
                                            className="mt-1"
                                        >
                                            {selectedLabOrder.status || 'ordered'}
                                        </Badge>
                                    </div>
                                    {selectedLabOrder.orderedBy && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">Ordered By</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">{selectedLabOrder.orderedBy.name || 'N/A'}</p>
                                        </div>
                                    )}
                                    {selectedLabOrder.updated_at && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-600">Last Updated</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {new Date(selectedLabOrder.updated_at).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Tests Ordered */}
                                {selectedLabOrder.lab_tests && selectedLabOrder.lab_tests.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">Tests Ordered ({selectedLabOrder.lab_tests.length})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLabOrder.lab_tests.map((test: any) => (
                                                <Badge key={test.id} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                    {test.name || test.code}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {selectedLabOrder.notes && (
                                    <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded">
                                        <p className="text-xs font-semibold text-gray-700 mb-1">Order Notes</p>
                                        <p className="text-sm text-gray-900">{selectedLabOrder.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setLabOrderModalOpen(false)}
                            >
                                Close
                            </Button>
                            {selectedLabOrder?.id && (
                                <>
                                    {selectedLabOrder.status !== 'completed' && (
                                        <Button
                                            onClick={() => {
                                                setLabOrderModalOpen(false);
                                                router.visit(`/admin/laboratory/orders/${selectedLabOrder.id}/results`);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <TestTube className="mr-2 h-4 w-4" />
                                            Enter Results
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => {
                                            setLabOrderModalOpen(false);
                                            router.visit(`/admin/laboratory/orders/${selectedLabOrder.id}`);
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Full Details
                                    </Button>
                                </>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </PatientPageLayout>
        </AppLayout>
    );
}
