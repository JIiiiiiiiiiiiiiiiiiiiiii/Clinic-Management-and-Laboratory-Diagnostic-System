import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientPageLayout, PatientActionButton, PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Calendar, User, Heart, Activity, Thermometer, Weight, Ruler, AlertCircle, Wind, Stethoscope, Clock } from 'lucide-react';
import Heading from '@/components/heading';

interface VisitShowProps {
    patient: any;
    visit: any;
}

const buildBreadcrumbs = (patientId: number): BreadcrumbItem[] => [
    { title: 'Patient Management', href: '/admin/patient' },
    { title: 'Patient Details', href: `/admin/patient/${patientId}` },
];

export default function VisitShow({ patient, visit }: VisitShowProps) {
    const formatDate = (d: string) => new Date(d).toLocaleDateString();
    const formatTime = (t: string) => String(t).match(/\d{2}:\d{2}/)?.[0] ?? t;

    return (
        <AppLayout breadcrumbs={buildBreadcrumbs(patient.id)}>
            <Head title={`Visit on ${formatDate(visit.arrival_date)}`} />
            <PatientPageLayout
                title="Visit Details"
                description={`${patient.last_name}, ${patient.first_name} - ${formatDate(visit.arrival_date)} ${formatTime(visit.arrival_time)}`}
                icon={<Calendar className="h-6 w-6 text-black" />}
                actions={
                    <div className="flex items-center gap-3">
                        <PatientActionButton
                            variant="outline"
                            icon={<ArrowLeft className="h-4 w-4" />}
                            label="Back to Patient"
                            href={`/admin/patient/${patient.id}?tab=visits`}
                            className="hover:bg-gray-50"
                        />
                        <PatientActionButton
                            variant="default"
                            icon={<Edit className="h-4 w-4" />}
                            label="Edit Visit"
                            href={`/admin/patient/${patient.id}/visits/${visit.id}/edit`}
                            className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        />
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
                            onClick={() =>
                                router.delete(`/admin/patient/${patient.id}/visits/${visit.id}`, {
                                    onSuccess: () => router.visit(`/admin/patient/${patient.id}/visits`),
                                })
                            }
                        >
                            <Trash2 className="mr-2 h-5 w-5" />
                            Delete Visit
                        </Button>
                    </div>
                }
            >

                {/* Main Content Grid */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Arrival & Status Card */}
                    <PatientInfoCard
                        title="Arrival & Status"
                        icon={<Calendar className="h-5 w-5 text-black" />}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-black" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-700">Arrival Time</div>
                                        <div className="text-sm text-gray-600">{formatDate(visit.arrival_date)} {formatTime(visit.arrival_time)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Activity className="h-5 w-5 text-black" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-700">Mode of Arrival</div>
                                        <div className="text-sm text-gray-600">{visit.mode_of_arrival || '—'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-black" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-700">Status</div>
                                        <Badge className="bg-gray-100 text-black hover:bg-gray-100 px-3 py-1 rounded-full">
                                            {visit.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PatientInfoCard>

                    {/* Consultation Card */}
                    <PatientInfoCard
                        title="Consultation"
                        icon={<User className="h-5 w-5 text-black" />}
                    >
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <User className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Attending Physician</div>
                                </div>
                                <div className="text-sm text-gray-600 ml-11">{visit.attending_physician}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Reason for Consultation</div>
                                </div>
                                <div className="text-sm text-gray-600 ml-11">{visit.reason_for_consult || '—'}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Activity className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Assessment & Diagnosis</div>
                                </div>
                                <div className="text-sm text-gray-600 ml-11">{visit.assessment_diagnosis || '—'}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Notes</div>
                                </div>
                                <div className="text-sm text-gray-600 ml-11">{visit.notes || '—'}</div>
                            </div>
                        </div>
                    </PatientInfoCard>
                </div>

                {/* Vital Signs Card */}
                <div className="mt-8">
                    <PatientInfoCard
                        title="Vital Signs"
                        icon={<Heart className="h-5 w-5 text-black" />}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Heart className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Blood Pressure</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 ml-11">{visit.blood_pressure || '—'}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Activity className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Heart Rate</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 ml-11">{visit.heart_rate || '—'}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Wind className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Respiratory Rate</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 ml-11">{visit.respiratory_rate || '—'}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Thermometer className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Temperature</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 ml-11">{visit.temperature || '—'}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Weight className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Weight</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 ml-11">{visit.weight_kg || '—'} kg</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Ruler className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Height</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 ml-11">{visit.height_cm || '—'} cm</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">Pain Scale</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 ml-11">{visit.pain_assessment_scale || '—'}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Wind className="h-5 w-5 text-black" />
                                    </div>
                                    <div className="font-semibold text-gray-700">O2 Saturation</div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900 ml-11">{visit.oxygen_saturation || '—'}%</div>
                            </div>
                        </div>
                    </PatientInfoCard>
                </div>
            </PatientPageLayout>
        </AppLayout>
    );
}
