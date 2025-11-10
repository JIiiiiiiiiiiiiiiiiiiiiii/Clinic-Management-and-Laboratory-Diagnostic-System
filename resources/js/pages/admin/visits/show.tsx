import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Edit, ArrowRight, User, Stethoscope, FileText, ArrowLeft, Trash2, Activity, ClipboardList, Heart, ArrowRightLeft, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Visits', href: '/admin/visits' },
    { title: 'Visit Details', href: '#' },
];

interface VisitShowProps {
    visit: {
        id: number;
        visit_date: string;
        visit_date_time_time?: string;
        purpose: string;
        notes?: string;
        status: string;
        visit_type: string;
        // Clinical fields
        arrival_date?: string;
        arrival_time?: string;
        mode_of_arrival?: string;
        blood_pressure?: string;
        heart_rate?: string;
        respiratory_rate?: string;
        temperature?: string;
        weight_kg?: number;
        height_cm?: number;
        pain_assessment_scale?: string;
        oxygen_saturation?: string;
        reason_for_consult?: string;
        time_seen?: string;
        history_of_present_illness?: string;
        pertinent_physical_findings?: string;
        assessment_diagnosis?: string;
        plan_management?: string;
        transfer_required?: boolean;
        transfer_reason_notes?: string;
        patient: {
            patient_id: number;
            first_name: string;
            last_name: string;
            middle_name?: string;
            patient_no: string;
            sequence_number?: string;
            mobile_no?: string;
            telephone_no?: string;
            age: number;
            sex: string;
            birthdate?: string;
            occupation?: string;
            religion?: string;
            civil_status?: string;
            nationality?: string;
            present_address?: string;
            informant_name?: string;
            relationship?: string;
            hmo_name?: string;
            hmo_company_id_no?: string;
            drug_allergies?: string;
            food_allergies?: string;
        };
        staff?: {
            id: number;
            name: string;
            role: string;
        };
        appointment?: {
            id: number;
            appointment_type: string;
            specialist_name: string;
        };
        follow_up_visits?: Array<{
            id: number;
            visit_date: string;
            purpose: string;
            status: string;
            staff: {
                name: string;
            };
        }>;
    };
    patient?: any; // Full patient data
}

export default function VisitShow({ visit, patient }: VisitShowProps) {
    const { hasPermission } = useRoleAccess();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getVisitTypeColor = (type: string) => {
        switch (type) {
            case 'initial': return 'bg-blue-100 text-blue-800';
            case 'follow_up': return 'bg-purple-100 text-purple-800';
            case 'lab_result_review': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDateTime = (dateTime: string | null | undefined) => {
        if (!dateTime) return 'No date set';
        
        try {
            const date = new Date(dateTime);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatTime = (time: string | null | undefined) => {
        if (!time) return 'N/A';
        if (time.includes(':')) {
            return time.substring(0, 5); // Return HH:mm
        }
        return time;
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return date;
        }
    };

    // Use patient prop if available, otherwise use visit.patient
    const patientData = patient || visit.patient;

    const handleStatusUpdate = (status: string) => {
        if (confirm(`Are you sure you want to mark this visit as ${status}?`)) {
            router.put(`/admin/visits/${visit.id}/${status === 'completed' ? 'complete' : 'cancel'}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Visit Details - ${visit.patient.first_name} ${visit.patient.last_name}`} />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Visit Details</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {visit.patient.first_name} {visit.patient.last_name} - {visit.patient.patient_code || visit.patient.sequence_number || visit.patient.patient_no}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/visits">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Visits
                                </Button>
                            </Link>
                            
                            <div className="flex items-center gap-2">
                                {hasPermission('canEditAppointments') && (
                                    <Link href={`/admin/visits/${visit.id}/edit`}>
                                        <Button variant="outline">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Visit
                                        </Button>
                                    </Link>
                                )}

                                {hasPermission('canEditAppointments') && visit.status !== 'completed' && (
                                    <Link href={`/admin/visits/${visit.id}/follow-up`}>
                                        <Button>
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Create Follow-up
                                        </Button>
                                    </Link>
                                )}

                                {hasPermission('canDeleteAppointments') && (
                                    <Button 
                                        variant="destructive"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this visit?')) {
                                                router.delete(`/admin/visits/${visit.id}`);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Actions */}
                    {visit.status !== 'completed' && visit.status !== 'cancelled' && hasPermission('canEditAppointments') && (
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-700">Update Status:</span>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleStatusUpdate('completed')}
                                        className="text-green-600 hover:text-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Completed
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleStatusUpdate('cancelled')}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Clock className="h-4 w-4 mr-2" />
                                        Cancel Visit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Visit Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Patient Information Card (Read-Only) */}
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Patient Information
                                    </CardTitle>
                                    <CardDescription>Basic patient information from patient record</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label className="text-xs text-gray-500">Name</Label>
                                            <p className="font-semibold">{patientData.first_name} {patientData.middle_name} {patientData.last_name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Patient No.</Label>
                                            <p className="font-semibold">{patientData.patient_no || patientData.sequence_number}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Birthdate</Label>
                                            <p className="font-semibold">{patientData.birthdate ? formatDate(patientData.birthdate) : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Age / Sex</Label>
                                            <p className="font-semibold">{patientData.age || 'N/A'} / {patientData.sex ? patientData.sex.charAt(0).toUpperCase() + patientData.sex.slice(1) : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Occupation</Label>
                                            <p className="font-semibold">{patientData.occupation || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Religion</Label>
                                            <p className="font-semibold">{patientData.religion || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Civil Status</Label>
                                            <p className="font-semibold">{patientData.civil_status || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Nationality</Label>
                                            <p className="font-semibold">{patientData.nationality || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-xs text-gray-500">Address</Label>
                                            <p className="font-semibold">{patientData.present_address || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Mobile No.</Label>
                                            <p className="font-semibold">{patientData.mobile_no || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Emergency Contact</Label>
                                            <p className="font-semibold">{patientData.informant_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Drug Allergies</Label>
                                            <p className="font-semibold text-red-600">{patientData.drug_allergies || 'NONE'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500">Food Allergies</Label>
                                            <p className="font-semibold text-red-600">{patientData.food_allergies || 'NONE'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Arrival Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Arrival Information
                                    </CardTitle>
                                    <CardDescription>TO BE FILLED OUT BY EMERGENCY STAFF NURSE</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Arrival Date</Label>
                                            <p className="text-lg font-semibold">{visit.arrival_date ? formatDate(visit.arrival_date) : <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Arrival Time</Label>
                                            <p className="text-lg font-semibold">{visit.arrival_time ? formatTime(visit.arrival_time) : <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Mode of Arrival</Label>
                                            <p className="text-lg font-semibold">{visit.mode_of_arrival || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Attending Physician */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5" />
                                        Attending Physician
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Attending Physician</Label>
                                        <p className="text-lg font-semibold">
                                            {visit.staff?.name ? (
                                                <span>{visit.staff.name} <span className="text-sm font-normal text-gray-500">({visit.staff.role})</span></span>
                                            ) : (
                                                <span className="text-gray-400 italic">Not assigned</span>
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Vital Signs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Initial Vital Signs
                                    </CardTitle>
                                    <CardDescription>TO BE FILLED OUT BY EMERGENCY STAFF NURSE</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">BP (mmHg)</Label>
                                            <p className="text-lg font-semibold">{visit.blood_pressure || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">HR (bpm)</Label>
                                            <p className="text-lg font-semibold">{visit.heart_rate || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">RR (breaths/min)</Label>
                                            <p className="text-lg font-semibold">{visit.respiratory_rate || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">T (°C)</Label>
                                            <p className="text-lg font-semibold">{visit.temperature || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Weight (kg)</Label>
                                            <p className="text-lg font-semibold">{visit.weight_kg || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Height (cm)</Label>
                                            <p className="text-lg font-semibold">{visit.height_cm || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">Pain Assessment Scale</Label>
                                            <p className="text-lg font-semibold">{visit.pain_assessment_scale || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-500">O2 Saturation (%)</Label>
                                            <p className="text-lg font-semibold">{visit.oxygen_saturation || <span className="text-gray-400 italic">Not recorded</span>}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Clinical Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5" />
                                        Clinical Information
                                    </CardTitle>
                                    <CardDescription>TO BE FILLED OUT BY RESIDENT ON DUTY</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Reason for Consult</Label>
                                        {visit.reason_for_consult ? (
                                            <p className="text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{visit.reason_for_consult}</p>
                                        ) : (
                                            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md">Not recorded</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Time Seen</Label>
                                        <p className="text-lg font-semibold">{visit.time_seen ? formatTime(visit.time_seen) : <span className="text-gray-400 italic">Not recorded</span>}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">History of Present Illness</Label>
                                        {visit.history_of_present_illness ? (
                                            <p className="text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{visit.history_of_present_illness}</p>
                                        ) : (
                                            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md">Not recorded</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Pertinent Physical Findings</Label>
                                        {visit.pertinent_physical_findings ? (
                                            <p className="text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{visit.pertinent_physical_findings}</p>
                                        ) : (
                                            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md">Not recorded</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Assessment / Diagnosis</Label>
                                        {visit.assessment_diagnosis ? (
                                            <p className="text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{visit.assessment_diagnosis}</p>
                                        ) : (
                                            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md">Not recorded</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-500">Plan / Management</Label>
                                        {visit.plan_management ? (
                                            <p className="text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{visit.plan_management}</p>
                                        ) : (
                                            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-md">Not recorded</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Transfer Decision */}
                            {visit.transfer_required && (
                                <Card className="border-orange-200 bg-orange-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ArrowRightLeft className="h-5 w-5 text-orange-600" />
                                            Transfer Decision
                                        </CardTitle>
                                        <CardDescription>
                                            This patient has been marked for transfer by the attending physician
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-2 p-3 bg-orange-100 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-orange-600" />
                                            <span className="font-semibold text-orange-900">Patient Requires Transfer</span>
                                        </div>
                                        
                                        {visit.transfer_reason_notes && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-orange-900">Transfer Reason / Physician's Remarks</Label>
                                                <p className="text-orange-900 bg-orange-100 p-4 rounded-md whitespace-pre-wrap border border-orange-200">
                                                    {visit.transfer_reason_notes}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="pt-2">
                                            <Link href={`/admin/patient-transfers/transfers/create?patient_id=${patientData.patient_id || patientData.id}`}>
                                                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                                                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                                                    Create Transfer Record
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Visit Details */}
                            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Visit Information</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                        <p className="text-lg font-semibold">{formatDateTime(visit.visit_date)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Purpose</label>
                                        <p className="text-lg font-semibold">{visit.purpose || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div>
                                            <Badge className={getStatusColor(visit.status)}>
                                                {visit.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Visit Type</label>
                                        <div>
                                            <Badge className={getVisitTypeColor(visit.visit_type || 'initial')}>
                                                {visit.visit_type ? visit.visit_type.replace('_', ' ').toUpperCase() : 'INITIAL'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {visit.notes && (
                                    <div className="space-y-2 mt-6">
                                        <label className="text-sm font-medium text-gray-500">Additional Notes</label>
                                        <p className="text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{visit.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Staff Information */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5" />
                                    Attending Staff
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Stethoscope className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold">{visit.staff?.name || 'No staff assigned'}</p>
                                        <p className="text-sm text-gray-500 capitalize">{visit.staff?.role || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Appointment Information */}
                        {visit.appointment && (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Related Appointment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Appointment Type</label>
                                            <p className="text-lg font-semibold">{visit.appointment.appointment_type}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Specialist</label>
                                            <p className="text-lg font-semibold">{visit.appointment.specialist_name}</p>
                                        </div>
                                        <div className="pt-2">
                                            <Link href={`/admin/appointments/${visit.appointment.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Appointment Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Follow-up Visits */}
                        {visit.follow_up_visits && visit.follow_up_visits.length > 0 && (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <ArrowRight className="h-5 w-5" />
                                        Follow-up Visits
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-4">
                                        {visit.follow_up_visits.map((followUp) => (
                                            <div key={followUp.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <p className="font-medium">{followUp.purpose}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDateTime(followUp.visit_date)}
                                                        </p>
                                                    </div>
                                                    <Badge className={getStatusColor(followUp.status)}>
                                                        {followUp.status.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-500">
                                                        Staff: {followUp.staff?.name || 'No staff assigned'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <Link href={`/admin/visits/${followUp.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                                <Link href={`/admin/patient/${visit.patient.patient_id}`} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <User className="h-4 w-4 mr-2" />
                                        View Patient Profile
                                    </Button>
                                </Link>
                                
                                <Link href={`/admin/appointments?patient=${visit.patient.patient_id}`} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        View Patient Appointments
                                    </Button>
                                </Link>

                                {visit.status !== 'completed' && hasPermission('canEditAppointments') && (
                                    <Link href={`/admin/visits/${visit.id}/follow-up`} className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Create Follow-up Visit
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
