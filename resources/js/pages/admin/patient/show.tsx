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
import { ArrowLeft, Calendar, Edit, Plus, TestTube, Trash2, User, Phone, Mail, MapPin, Clock, Stethoscope, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Heading from '@/components/heading';
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

    const getSexBadgeVariant = (sex: string): "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline" => {
        switch (sex) {
            case 'male':
                return 'default';
            case 'female':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const getCivilStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline" => {
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button asChild variant="ghost" size="icon" className="bg-white hover:bg-gray-50 shadow-md">
                                <Link href="/admin/patient">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Heading 
                                title={`${patient.first_name} ${patient.last_name}`} 
                                description={`Patient No: ${patient.patient_no}`} 
                                icon={User} 
                            />
                        </div>
                        <div className="flex items-center gap-6">
                            <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <Link href={`/admin/patient/${patient.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Patient
                                </Link>
                            </Button>
                            <Button 
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                                onClick={() => setConfirmOpen(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
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

                {/* Patient Details Section */}
                <div className="holographic-card shadow-lg border-0 mb-8 overflow-hidden rounded-lg bg-white">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-normal text-white">Patient Information</h3>
                                <p className="text-blue-100 mt-1">Complete patient profile and medical history</p>
                            </div>
                        </div>
                    </div>
                    {/* Content Section */}
                    <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-blue-100">
                        <Tabs defaultValue={activeTab}>
                            <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-2 mb-6 gap-2">
                                <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300">Patient Details</TabsTrigger>
                                <TabsTrigger value="visits" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300">Visit Records</TabsTrigger>
                                <TabsTrigger value="labs" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300">Lab Orders</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-6 pt-4">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Patient Identification */}
                                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-lg font-bold text-white">Patient Identification</h4>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {patient.last_name}, {patient.first_name} {patient.middle_name || ''}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Patient No.</p>
                                                    <p className="text-sm font-bold text-blue-600">{patient.patient_no}</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Birthdate</p>
                                                    <p className="text-sm font-semibold text-gray-900">{formatDate(patient.birthdate)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Age</p>
                                                    <p className="text-sm font-bold text-emerald-600">{patient.age} years</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Sex</p>
                                                    <Badge variant={getSexBadgeVariant(patient.sex)} className="mt-1">
                                                        {patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Nationality</p>
                                                    <p className="text-sm font-semibold text-gray-900">{patient.nationality}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                    <Phone className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-lg font-bold text-white">Contact Information</h4>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    Present Address
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">{patient.present_address}</p>
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Telephone No.</p>
                                                    <p className="text-sm font-semibold text-gray-900">{patient.telephone_no || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Mobile No.</p>
                                                    <p className="text-sm font-semibold text-black">{patient.mobile_no}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                        </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Demographics */}
                                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-lg font-bold text-white">Demographics</h4>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
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
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Civil Status</p>
                                                    <Badge variant={getCivilStatusBadgeVariant(patient.civil_status)} className="mt-1">
                                                        {patient.civil_status.charAt(0).toUpperCase() + patient.civil_status.slice(1)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                    <Phone className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-lg font-bold text-white">Emergency Contact</h4>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Informant Name</p>
                                                    <p className="text-sm font-bold text-black">{patient.informant_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Relationship</p>
                                                    <p className="text-sm font-semibold text-gray-900">{patient.relationship}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Medical History & Allergies */}
                                <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                <Stethoscope className="h-5 w-5 text-white" />
                                            </div>
                                            <h4 className="text-lg font-bold text-white">Medical History & Allergies</h4>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Drug Allergies</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.drug_allergies || 'None reported'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Food Allergies</p>
                                                <p className="text-sm font-semibold text-gray-900">{patient.food_allergies || 'None reported'}</p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Past Medical History</p>
                                            <p className="text-sm font-semibold text-gray-900">{patient.past_medical_history || 'No past history recorded'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Family History</p>
                                            <p className="text-sm font-semibold text-gray-900">{patient.family_history || 'No family history recorded'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Social/Personal History</p>
                                            <p className="text-sm font-semibold text-gray-900">{patient.social_personal_history || 'No social history recorded'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Obstetrics & Gynecology History</p>
                                            <p className="text-sm font-semibold text-gray-900">{patient.obstetrics_gynecology_history || 'No OB-GYN history recorded'}</p>
                                        </div>
                                    </div>
                                </div>
                    </TabsContent>

                            <TabsContent value="visits" className="pt-4">
                                <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                    <Calendar className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-lg font-bold text-white">Visit Records</h4>
                                            </div>
                                            <Button 
                                                className="bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                                                onClick={() => router.visit(`/admin/patient/${patient.id}/visits/create`)}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                New Visit
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {visits && visits.length > 0 ? (
                                            <div className="space-y-4">
                                                {visits.map((visit) => (
                                                    <div key={visit.id} className="holographic-card shadow-md overflow-hidden rounded-lg bg-white/80 backdrop-blur-sm border border-white/60 p-4">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-purple-600" />
                                                                {formatDate(visit.arrival_date)}
                                                            </h4>
                                                            <Badge
                                                                variant={
                                                                    visit.status === 'completed'
                                                                        ? 'success'
                                                                        : visit.status === 'active'
                                                                          ? 'default'
                                                                          : 'destructive'
                                                                }
                                                                className="flex items-center gap-1"
                                                            >
                                                                {visit.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                                                {visit.status === 'active' && <AlertCircle className="w-3 h-3" />}
                                                                {visit.status === 'discharged' && <XCircle className="w-3 h-3" />}
                                                                {visit.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="mb-3 text-sm text-gray-700 space-y-1">
                                                            <p className="flex items-center gap-2">
                                                                <Stethoscope className="h-4 w-4 text-purple-600" />
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
                                                                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-lg"
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
                                                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                <h3 className="mb-2 text-lg font-semibold text-gray-900">No Visits Yet</h3>
                                                <p className="mb-4 text-gray-600">This patient hasn't had any visits recorded yet.</p>
                                                <Button 
                                                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                                                    onClick={() => router.visit(`/admin/patient/${patient.id}/visits/create`)}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create First Visit
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="labs" className="pt-4">
                                <div className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
                                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                                    <TestTube className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-lg font-bold text-white">Laboratory Orders</h4>
                                            </div>
                                            <Button 
                                                className="bg-white text-green-600 hover:bg-green-50 hover:text-green-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                                                onClick={() => router.visit(`/admin/laboratory/patients/${patient.id}/orders`)}
                                            >
                                                <TestTube className="mr-2 h-4 w-4" />
                                                Manage Lab Orders
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {labOrders && labOrders.length > 0 ? (
                                            <div className="space-y-4">
                                                {labOrders.map((order: any) => (
                                                    <div key={order.id} className="holographic-card shadow-md overflow-hidden rounded-lg bg-white/80 backdrop-blur-sm border border-white/60 p-4">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                                                <TestTube className="h-4 w-4 text-green-600" />
                                                                Order #{order.id}
                                                            </h4>
                                                            <Badge
                                                                variant={
                                                                    order.status === 'completed'
                                                                        ? 'success'
                                                                        : order.status === 'processing'
                                                                          ? 'default'
                                                                          : 'destructive'
                                                                }
                                                                className="flex items-center gap-1"
                                                            >
                                                                {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                                                {order.status === 'processing' && <AlertCircle className="w-3 h-3" />}
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="mb-3 text-sm text-gray-700 space-y-1">
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
                                                            <p className="mb-2 text-sm font-medium text-gray-600">Tests Ordered:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {order.lab_tests?.map((test: any) => (
                                                                    <Badge key={test.id} variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                                        {test.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-lg"
                                                                onClick={() => router.visit(`/admin/laboratory/orders/${order.id}/results`)}
                                                            >
                                                                Enter Results
                                                            </Button>
                                                            <Button
                                                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm font-semibold rounded-lg"
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
                                                <TestTube className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                <h3 className="mb-2 text-lg font-semibold text-gray-900">No Lab Orders Yet</h3>
                                                <p className="mb-4 text-gray-600">
                                                    Create laboratory orders for this patient to track diagnostic tests and results.
                                                </p>
                                                <Button 
                                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                                                    onClick={() => router.visit(`/admin/laboratory/patients/${patient.id}/orders`)}
                                                >
                                                    <TestTube className="mr-2 h-4 w-4" />
                                                    Create Lab Order
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* System Information */}
                <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                        <div className="flex items-center gap-3 p-6">
                            <div className="p-2 bg-gradient-to-r from-[#063970] to-[#052b54] rounded-lg border border-white/60">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">System Information</h3>
                                <p className="text-gray-100 mt-1">Record creation and modification details</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-4">
                                <p className="text-sm font-medium text-gray-600 mb-2">Created</p>
                                <p className="text-lg font-bold text-gray-900">{formatDate(patient.created_at)}</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-4">
                                <p className="text-sm font-medium text-gray-600 mb-2">Last Updated</p>
                                <p className="text-lg font-bold text-gray-900">{formatDate(patient.updated_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
