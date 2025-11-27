import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SharedNavigation from '@/components/SharedNavigation';
import { Head } from '@inertiajs/react';
import { Calendar, FileText, Heart, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { formatAppointmentType } from '@/utils/formatAppointmentType';


interface PatientRecordsProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    records: {
        visits: Array<{
            id: number;
            visit_code: string;
            visit_date: string;
            visit_time: string;
            visit_date_time: string | null;
            purpose: string;
            status: string;
            visit_type: string;
            specialist_name: string;
            appointment_id: number | null;
            appointment_type: string | null;
            reason_for_consult: string | null;
            assessment_diagnosis: string | null;
            plan_management: string | null;
            notes: string | null;
            vital_signs: {
                blood_pressure: string | null;
                heart_rate: number | null;
                respiratory_rate: number | null;
                temperature: number | null;
                weight_kg: number | null;
                height_cm: number | null;
                oxygen_saturation: number | null;
            };
            created_at: string;
        }>;
        lab_orders: Array<{
            id: number;
            created_at: string;
            tests: string[];
            status: string;
            notes: string;
            ordered_by: string;
        }>;
        lab_results: Array<{
            id: number;
            test_name: string;
            result_value: string;
            normal_range: string;
            unit: string;
            status: string;
            verified_at: string | null;
            created_at: string;
            order_id: number;
            detailed_values?: Array<{
                parameter_key: string;
                parameter_label: string;
                value: string;
                unit?: string;
                reference_text?: string;
                reference_min?: string;
                reference_max?: string;
            }>;
        }>;
    };
    notifications?: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount?: number;
}

const getStatusBadge = (status: string) => {
    const statusConfig = {
        Active: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
    };

    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
};

export default function PatientRecords({ user, patient, records, notifications = [], unreadCount = 0 }: PatientRecordsProps) {
    const [expandedVisits, setExpandedVisits] = useState<Set<number>>(new Set());

    const toggleVisit = (visitId: number) => {
        setExpandedVisits(prev => {
            const newSet = new Set(prev);
            if (newSet.has(visitId)) {
                newSet.delete(visitId);
            } else {
                newSet.add(visitId);
            }
            return newSet;
        });
    };

    return (
        <div className="min-h-screen bg-white">
            <Head title="Medical Records" />
            
            {/* Shared Navigation */}
            <SharedNavigation user={user} currentPath="/patient/records" notifications={notifications} unreadCount={unreadCount} />
            
            <div className="min-h-screen bg-gray-50 p-6">

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Total Visits</p>
                                    <div className="text-2xl font-bold">{records?.visits?.length || 0}</div>
                                </div>
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Last Visit</p>
                                    <div className="text-sm font-bold text-green-600">
                                        {records?.visits && records.visits.length > 0 
                                            ? records.visits[0].visit_date 
                                            : 'N/A'}
                                    </div>
                                </div>
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Primary Doctor</p>
                                    <div className="text-sm font-bold text-purple-600">St. James Clinic</div>
                                </div>
                                <User className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Visits Section */}
                {records?.visits && records.visits.length > 0 && (
                    <Card className="mb-8">
                    <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Visit History
                                </CardTitle>
                            <CardDescription>Your complete visit history with the clinic</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {records.visits.map((visit) => {
                                    const isExpanded = expandedVisits.has(visit.id);
                                    return (
                                        <Card key={visit.id} className="border-l-4 border-l-blue-500">
                                            <CardHeader 
                                                className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => toggleVisit(visit.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-lg">Visit {visit.visit_code}</CardTitle>
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-5 w-5 text-gray-500" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5 text-gray-500" />
                                                            )}
                                                        </div>
                                                        <CardDescription>
                                                            {visit.visit_date} at {visit.visit_time}
                                                        </CardDescription>
                                                        {!isExpanded && (
                                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                                                <span>Type: {visit.visit_type}</span>
                                                                {visit.specialist_name && visit.specialist_name !== 'Unknown Specialist' && (
                                                                    <span>• Specialist: {visit.specialist_name}</span>
                                                                )}
                                                            </div>
                                                        )}
                            </div>
                                                    <Badge className={getStatusBadge(visit.status)}>{visit.status}</Badge>
                        </div>
                    </CardHeader>
                                            {isExpanded && (
                    <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Visit Type</p>
                                                    <p className="text-sm text-gray-900">{visit.visit_type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Specialist</p>
                                                    <p className="text-sm text-gray-900">{visit.specialist_name}</p>
                                                </div>
                                                {visit.appointment_type && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Appointment Type</p>
                                                        <p className="text-sm text-gray-900">{formatAppointmentType(visit.appointment_type)}</p>
                                                    </div>
                                                )}
                                                {(visit.purpose || visit.reason_for_consult) && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">Purpose/Reason</p>
                                                        <p className="text-sm text-gray-900">{visit.purpose || visit.reason_for_consult}</p>
                                                    </div>
                                                )}
                                                {visit.assessment_diagnosis && (
                                                    <div className="md:col-span-2">
                                                        <p className="text-sm font-medium text-gray-600">Assessment/Diagnosis</p>
                                                        <p className="text-sm text-gray-900">{visit.assessment_diagnosis}</p>
                                                    </div>
                                                )}
                                                {visit.plan_management && (
                                                    <div className="md:col-span-2">
                                                        <p className="text-sm font-medium text-gray-600">Plan/Management</p>
                                                        <p className="text-sm text-gray-900">{visit.plan_management}</p>
                                                    </div>
                                                )}
                                                {visit.notes && (
                                                    <div className="md:col-span-2">
                                                        <p className="text-sm font-medium text-gray-600">Notes</p>
                                                        <p className="text-sm text-gray-900">{visit.notes}</p>
                                                    </div>
                                                )}
                                                {visit.vital_signs && Object.values(visit.vital_signs).some(v => v !== null) && (
                                                    <div className="md:col-span-2">
                                                        <p className="text-sm font-medium text-gray-600 mb-2">Vital Signs</p>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {visit.vital_signs.blood_pressure && (
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">BP: </span>
                                                                    <span className="font-medium">{visit.vital_signs.blood_pressure}</span>
                                                                </div>
                                                            )}
                                                            {visit.vital_signs.heart_rate && (
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">HR: </span>
                                                                    <span className="font-medium">{visit.vital_signs.heart_rate} bpm</span>
                                                                </div>
                                                            )}
                                                            {visit.vital_signs.temperature && (
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">Temp: </span>
                                                                    <span className="font-medium">{visit.vital_signs.temperature}°C</span>
                                                                </div>
                                                            )}
                                                            {visit.vital_signs.weight_kg && (
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">Weight: </span>
                                                                    <span className="font-medium">{visit.vital_signs.weight_kg} kg</span>
                                                                </div>
                                                            )}
                                                            {visit.vital_signs.height_cm && (
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">Height: </span>
                                                                    <span className="font-medium">{visit.vital_signs.height_cm} cm</span>
                                                                </div>
                                                            )}
                                                            {visit.vital_signs.respiratory_rate && (
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">RR: </span>
                                                                    <span className="font-medium">{visit.vital_signs.respiratory_rate}</span>
                                                                </div>
                                                            )}
                                                            {visit.vital_signs.oxygen_saturation && (
                                                                <div className="text-sm">
                                                                    <span className="text-gray-600">SpO2: </span>
                                                                    <span className="font-medium">{visit.vital_signs.oxygen_saturation}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Records Message */}
                {(!records?.visits || records.visits.length === 0) && (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Medical Records Found</h3>
                            <p className="text-gray-600">You don't have any medical records yet. Your visit history and test results will appear here once available.</p>
                    </CardContent>
                </Card>
                )}
            </div>
        </div>
    );
}
