import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Calendar, User, Heart, Activity, Thermometer, Weight, Ruler, AlertCircle, Wind } from 'lucide-react';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 pb-12">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button asChild variant="ghost" size="icon" className="bg-white hover:bg-gray-50 shadow-md">
                                <Link href={`/admin/patient/${patient.id}?tab=visits`}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Heading 
                                title="Visit Details" 
                                description={`${patient.last_name}, ${patient.first_name} - ${formatDate(visit.arrival_date)} ${formatTime(visit.arrival_time)}`} 
                                icon={Calendar} 
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl">
                                <Link href={`/admin/patient/${patient.id}/visits/${visit.id}/edit`}>
                                    <Edit className="mr-2 h-5 w-5" />
                                    Edit Visit
                                </Link>
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
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
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Arrival & Status Card */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Arrival & Status</h3>
                                    <p className="text-purple-100 mt-1">Visit timing and current status</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-700">Arrival Time</div>
                                            <div className="text-sm text-gray-600">{formatDate(visit.arrival_date)} {formatTime(visit.arrival_time)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Activity className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-700">Mode of Arrival</div>
                                            <div className="text-sm text-gray-600">{visit.mode_of_arrival || '—'}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-700">Status</div>
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 rounded-full">
                                                {visit.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consultation Card */}
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Consultation</h3>
                                    <p className="text-green-100 mt-1">Medical consultation details</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-green-50 to-green-100">
                            <div className="space-y-4">
                                <div className="p-4 bg-white rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <User className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Attending Physician</div>
                                    </div>
                                    <div className="text-sm text-gray-600 ml-11">{visit.attending_physician}</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Reason for Consultation</div>
                                    </div>
                                    <div className="text-sm text-gray-600 ml-11">{visit.reason_for_consult || '—'}</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Activity className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Assessment & Diagnosis</div>
                                    </div>
                                    <div className="text-sm text-gray-600 ml-11">{visit.assessment_diagnosis || '—'}</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Calendar className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Notes</div>
                                    </div>
                                    <div className="text-sm text-gray-600 ml-11">{visit.notes || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vital Signs Card */}
                <div className="mt-8">
                    <div className="holographic-card shadow-lg border-0 overflow-hidden rounded-lg bg-white">
                        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                            <div className="flex items-center gap-3 p-6">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Vital Signs</h3>
                                    <p className="text-orange-100 mt-1">Patient vital measurements</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6 bg-gradient-to-br from-orange-50 to-red-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-white rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <Heart className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Blood Pressure</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 ml-11">{visit.blood_pressure || '—'}</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Activity className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Heart Rate</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 ml-11">{visit.heart_rate || '—'}</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Wind className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Respiratory Rate</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 ml-11">{visit.respiratory_rate || '—'}</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Thermometer className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Temperature</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 ml-11">{visit.temperature || '—'}</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Weight className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Weight</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 ml-11">{visit.weight_kg || '—'} kg</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Ruler className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Height</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 ml-11">{visit.height_cm || '—'} cm</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-pink-100 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-pink-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">Pain Scale</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 ml-11">{visit.pain_assessment_scale || '—'}</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-cyan-100 rounded-lg">
                                            <Wind className="h-5 w-5 text-cyan-600" />
                                        </div>
                                        <div className="font-semibold text-gray-700">O2 Saturation</div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 ml-11">{visit.oxygen_saturation || '—'}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
