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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Plus, Trash2, User } from 'lucide-react';
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
    time_seen: string;
    status: 'active' | 'completed' | 'discharged';
    notes: string;
    visit_number: string;
    full_arrival_date_time: string;
    created_at: string;
    updated_at: string;
}

interface VisitHistoryProps {
    patient: PatientItem;
    visits: PatientVisit[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function VisitHistory({ patient, visits, pagination }: VisitHistoryProps) {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [visitToDelete, setVisitToDelete] = React.useState<PatientVisit | null>(null);

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

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'completed':
                return 'secondary';
            case 'discharged':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const handleDeleteClick = (visit: PatientVisit) => {
        setVisitToDelete(visit);
        setConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (visitToDelete) {
            router.delete(`/admin/patient/${patient.id}/visits/${visitToDelete.id}`, {
                onSuccess: () => {
                    setConfirmOpen(false);
                    setVisitToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={buildBreadcrumbs(patient.id)}>
            <Head title={`Visit History - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/admin/patient/${patient.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Visit History</h1>
                            <p className="text-muted-foreground">
                                {patient.first_name} {patient.last_name} - Patient No: {patient.patient_no}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/admin/patient/${patient.id}/visits/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Visit
                        </Link>
                    </Button>
                </div>

                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete visit?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p className="text-sm text-muted-foreground">This action cannot be undone. This will permanently delete the visit record.</p>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-white hover:bg-red-700" onClick={handleDeleteConfirm}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {visits && visits.length > 0 ? (
                    <div className="space-y-4">
                        {visits.map((visit) => (
                            <Card key={visit.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Visit #{visit.visit_number}</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(visit.arrival_date)} at {formatTime(visit.arrival_time)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getStatusBadgeVariant(visit.status)}>
                                                {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                                            </Badge>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/patient/${patient.id}/visits/${visit.id}/edit`}>
                                                    <Edit className="mr-1 h-3 w-3" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(visit)}>
                                                <Trash2 className="mr-1 h-3 w-3" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Attending Physician</p>
                                                <p className="text-sm">{visit.attending_physician}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Reason for Consult</p>
                                                <p className="text-sm">{visit.reason_for_consult || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Mode of Arrival</p>
                                                <p className="text-sm">{visit.mode_of_arrival || 'Not specified'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Time Seen</p>
                                                <p className="text-sm">{formatTime(visit.time_seen)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                                <p className="text-sm">{formatDate(visit.created_at)}</p>
                                            </div>
                                            {visit.notes && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                                    <p className="text-sm">{visit.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="flex gap-2">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.visit(`/admin/patient/${patient.id}/visits/${visit.id}`)}
                                        >
                                            <Link href={`/admin/patient/${patient.id}/visits/${visit.id}`}>
                                                <User className="mr-1 h-3 w-3" />
                                                View Details
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">No Visits Yet</h3>
                            <p className="mb-4 text-muted-foreground">
                                This patient hasn't had any visits recorded yet. Create the first visit to start tracking their medical history.
                            </p>
                            <Button asChild>
                                <Link href={`/admin/patient/${patient.id}/visits/create`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Visit
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === 1}
                            onClick={() => router.visit(`/admin/patient/${patient.id}/visits?page=${pagination.current_page - 1}`)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => router.visit(`/admin/patient/${patient.id}/visits?page=${pagination.current_page + 1}`)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
