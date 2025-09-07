import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/admin/patient/${patient.id}?tab=visits`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Visit Details</h1>
                            <p className="text-muted-foreground">
                                {patient.last_name}, {patient.first_name} • {formatDate(visit.arrival_date)} {formatTime(visit.arrival_time)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/patient/${patient.id}/visits/${visit.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(`/admin/patient/${patient.id}/visits/${visit.id}`, {
                                    onSuccess: () => router.visit(`/admin/patient/${patient.id}/visits`),
                                })
                            }
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Arrival & Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">Arrival:</span> {formatDate(visit.arrival_date)} {formatTime(visit.arrival_time)}
                            </div>
                            <div>
                                <span className="font-medium">Mode of Arrival:</span> {visit.mode_of_arrival || '—'}
                            </div>
                            <div>
                                <span className="font-medium">Status:</span> <Badge>{visit.status}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Consultation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">Attending Physician:</span> {visit.attending_physician}
                            </div>
                            <div>
                                <span className="font-medium">Reason:</span> {visit.reason_for_consult || '—'}
                            </div>
                            <div>
                                <span className="font-medium">Diagnosis:</span> {visit.assessment_diagnosis || '—'}
                            </div>
                            <div>
                                <span className="font-medium">Notes:</span> {visit.notes || '—'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Vital Signs</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                            <span className="font-medium">BP:</span> {visit.blood_pressure || '—'}
                        </div>
                        <div>
                            <span className="font-medium">HR:</span> {visit.heart_rate || '—'}
                        </div>
                        <div>
                            <span className="font-medium">RR:</span> {visit.respiratory_rate || '—'}
                        </div>
                        <div>
                            <span className="font-medium">Temp:</span> {visit.temperature || '—'}
                        </div>
                        <div>
                            <span className="font-medium">Weight:</span> {visit.weight_kg || '—'}
                        </div>
                        <div>
                            <span className="font-medium">Height:</span> {visit.height_cm || '—'}
                        </div>
                        <div>
                            <span className="font-medium">Pain:</span> {visit.pain_assessment_scale || '—'}
                        </div>
                        <div>
                            <span className="font-medium">O2 Sat:</span> {visit.oxygen_saturation || '—'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
