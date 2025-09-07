import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

const buildBreadcrumbs = (patientId: number): BreadcrumbItem[] => [
    { title: 'Patient Management', href: '/admin/patient' },
    { title: 'Patient Details', href: `/admin/patient/${patientId}` },
    { title: 'Edit Visit', href: `/admin/patient/${patientId}?tab=visits` },
];

type Doctor = { id: number; name: string };

interface EditVisitProps {
    patient: PatientItem;
    visit: any;
    doctors: Doctor[];
}

export default function EditVisit({ patient, visit, doctors }: EditVisitProps) {
    const normalizeDate = (value?: string | null) => (value ? String(value).slice(0, 10) : '');
    const normalizeTime = (value?: string | null) => {
        if (!value) return '';
        const match = String(value).match(/\d{2}:\d{2}/);
        return match ? match[0] : String(value);
    };

    const { data, setData, processing, errors } = useForm({
        // Arrival Information
        arrival_date: normalizeDate(visit.arrival_date),
        arrival_time: normalizeTime(visit.arrival_time),
        mode_of_arrival: visit.mode_of_arrival || '',

        // Visit Details
        attending_physician: visit.attending_physician || '',
        reason_for_consult: visit.reason_for_consult || '',
        time_seen: normalizeTime(visit.time_seen),

        // Vital Signs
        blood_pressure: visit.blood_pressure || '',
        heart_rate: visit.heart_rate || '',
        respiratory_rate: visit.respiratory_rate || '',
        temperature: visit.temperature || '',
        weight_kg: visit.weight_kg ?? 0,
        height_cm: visit.height_cm ?? 0,
        pain_assessment_scale: visit.pain_assessment_scale || '',
        oxygen_saturation: visit.oxygen_saturation || '',

        // Medical Assessment
        history_of_present_illness: visit.history_of_present_illness || '',
        pertinent_physical_findings: visit.pertinent_physical_findings || '',
        plan_management: visit.plan_management || '',
        assessment_diagnosis: visit.assessment_diagnosis || '',
        lmp: visit.lmp || '',

        // Visit Status
        status: (visit.status as 'active' | 'completed' | 'discharged') || 'active',
        notes: visit.notes || '',
    });

    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        const requiredChecks: Array<{ key: keyof typeof data; label: string; isValid: (v: any) => boolean }> = [
            { key: 'arrival_date', label: 'Arrival Date', isValid: (v) => Boolean(v) },
            { key: 'arrival_time', label: 'Arrival Time', isValid: (v) => Boolean(v) },
            { key: 'attending_physician', label: 'Attending Physician', isValid: (v) => Boolean(v) },
            { key: 'time_seen', label: 'Time Seen', isValid: (v) => Boolean(v) },
        ];
        const missing = requiredChecks.filter((c) => !c.isValid((data as any)[c.key]));
        if (missing.length > 0) {
            setMissingFields(missing.map((m) => m.label));
            setShowMissingModal(true);
            const el = document.getElementById(missing[0].key as string);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
            return;
        }

        router.put(
            `/admin/patient/${patient.id}/visits/${visit.id}`,
            { ...data },
            {
                onError: (errs) => {
                    const keys = Object.keys(errs || {});
                    if (keys.length > 0) {
                        const el = document.getElementById(keys[0]);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
                    }
                },
                onSuccess: () => {
                    router.visit(`/admin/patient/${patient.id}?tab=visits`);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={buildBreadcrumbs(patient.id)}>
            <Head title={`Edit Visit - ${patient.first_name} ${patient.last_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href={`/admin/patient/${patient.id}?tab=visits`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Visit</h1>
                            <p className="text-muted-foreground">
                                {patient.first_name} {patient.last_name} - Patient No: {patient.patient_no}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error alert */}
                {((usePage().props as any).flash?.error as string | undefined) && (
                    <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                        {String((usePage().props as any).flash?.error as string)}
                    </div>
                )}

                {/* Required fields missing modal */}
                <AlertDialog open={showMissingModal} onOpenChange={setShowMissingModal}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Missing required information</AlertDialogTitle>
                        </AlertDialogHeader>
                        <p className="text-sm" data-slot="description">
                            Please complete the following required field(s):
                        </p>
                        <ul className="list-disc pl-6 text-sm">
                            {missingFields.map((f) => (
                                <li key={f}>{f}</li>
                            ))}
                        </ul>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setShowMissingModal(false)}>OK</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <form onSubmit={submit} className="space-y-6">
                    {/* Arrival Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Arrival Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="arrival_date">Arrival Date *</Label>
                                    <Input
                                        id="arrival_date"
                                        type="date"
                                        value={data.arrival_date}
                                        onChange={(e) => setData('arrival_date', e.target.value)}
                                        className={errors.arrival_date ? 'border-red-500' : ''}
                                    />
                                    {errors.arrival_date && <p className="text-sm text-red-500">{errors.arrival_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="arrival_time">Arrival Time *</Label>
                                    <Input
                                        id="arrival_time"
                                        type="time"
                                        value={data.arrival_time}
                                        onChange={(e) => setData('arrival_time', e.target.value)}
                                        className={errors.arrival_time ? 'border-red-500' : ''}
                                    />
                                    {errors.arrival_time && <p className="text-sm text-red-500">{errors.arrival_time}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mode_of_arrival">Mode of Arrival</Label>
                                    <Input
                                        id="mode_of_arrival"
                                        value={data.mode_of_arrival}
                                        onChange={(e) => setData('mode_of_arrival', e.target.value)}
                                        placeholder="e.g., Ambulance, Walk-in, Private vehicle"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visit Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Visit Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="attending_physician">Attending Physician *</Label>
                                    {doctors.length > 0 ? (
                                        <Select
                                            onValueChange={(value: string) => setData('attending_physician', value)}
                                            defaultValue={data.attending_physician || undefined}
                                        >
                                            <SelectTrigger id="attending_physician" className={errors.attending_physician ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select doctor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {doctors.map((d) => (
                                                    <SelectItem key={d.id} value={d.name}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            id="attending_physician"
                                            value={data.attending_physician}
                                            onChange={(e) => setData('attending_physician', e.target.value)}
                                            className={errors.attending_physician ? 'border-red-500' : ''}
                                        />
                                    )}
                                    {errors.attending_physician && <p className="text-sm text-red-500">{errors.attending_physician}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time_seen">Time Seen *</Label>
                                    <Input
                                        id="time_seen"
                                        type="time"
                                        value={data.time_seen}
                                        onChange={(e) => setData('time_seen', e.target.value)}
                                        className={errors.time_seen ? 'border-red-500' : ''}
                                    />
                                    {errors.time_seen && <p className="text-sm text-red-500">{errors.time_seen}</p>}
                                </div>
                            </div>
                            <div className="mt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="reason_for_consult">Reason for Consult</Label>
                                    <Textarea
                                        id="reason_for_consult"
                                        value={data.reason_for_consult}
                                        onChange={(e) => setData('reason_for_consult', e.target.value)}
                                        placeholder="Primary reason for seeking medical attention"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vital Signs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vital Signs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="blood_pressure">Blood Pressure</Label>
                                    <Input
                                        id="blood_pressure"
                                        value={data.blood_pressure}
                                        onChange={(e) => setData('blood_pressure', e.target.value)}
                                        placeholder="e.g., 120/80"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="heart_rate">Heart Rate</Label>
                                    <Input
                                        id="heart_rate"
                                        value={data.heart_rate}
                                        onChange={(e) => setData('heart_rate', e.target.value)}
                                        placeholder="bpm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
                                    <Input
                                        id="respiratory_rate"
                                        value={data.respiratory_rate}
                                        onChange={(e) => setData('respiratory_rate', e.target.value)}
                                        placeholder="breaths/min"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="temperature">Temperature</Label>
                                    <Input
                                        id="temperature"
                                        value={data.temperature}
                                        onChange={(e) => setData('temperature', e.target.value)}
                                        placeholder="°C"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 grid gap-6 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                                    <Input
                                        id="weight_kg"
                                        type="number"
                                        step="0.1"
                                        value={data.weight_kg}
                                        onChange={(e) => setData('weight_kg', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height_cm">Height (cm)</Label>
                                    <Input
                                        id="height_cm"
                                        type="number"
                                        step="0.1"
                                        value={data.height_cm}
                                        onChange={(e) => setData('height_cm', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pain_assessment_scale">Pain Assessment Scale</Label>
                                    <Input
                                        id="pain_assessment_scale"
                                        value={data.pain_assessment_scale}
                                        onChange={(e) => setData('pain_assessment_scale', e.target.value)}
                                        placeholder="0-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="oxygen_saturation">O2 Saturation</Label>
                                    <Input
                                        id="oxygen_saturation"
                                        value={data.oxygen_saturation}
                                        onChange={(e) => setData('oxygen_saturation', e.target.value)}
                                        placeholder="%"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical Assessment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="history_of_present_illness">History of Present Illness</Label>
                                    <Textarea
                                        id="history_of_present_illness"
                                        value={data.history_of_present_illness}
                                        onChange={(e) => setData('history_of_present_illness', e.target.value)}
                                        placeholder="Detailed history of current symptoms"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pertinent_physical_findings">Pertinent Physical Findings</Label>
                                    <Textarea
                                        id="pertinent_physical_findings"
                                        value={data.pertinent_physical_findings}
                                        onChange={(e) => setData('pertinent_physical_findings', e.target.value)}
                                        placeholder="Physical examination findings"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plan_management">Plan/Management</Label>
                                    <Textarea
                                        id="plan_management"
                                        value={data.plan_management}
                                        onChange={(e) => setData('plan_management', e.target.value)}
                                        placeholder="Treatment plan and management"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="assessment_diagnosis">Assessment/Diagnosis</Label>
                                    <Textarea
                                        id="assessment_diagnosis"
                                        value={data.assessment_diagnosis}
                                        onChange={(e) => setData('assessment_diagnosis', e.target.value)}
                                        placeholder="Clinical assessment and diagnosis"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lmp">Last Menstrual Period (LMP)</Label>
                                    <Input
                                        id="lmp"
                                        value={data.lmp}
                                        onChange={(e) => setData('lmp', e.target.value)}
                                        placeholder="Date of last period"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visit Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Visit Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select onValueChange={(value: any) => setData('status', value)} defaultValue={data.status}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="discharged">Discharged</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Additional notes about this visit"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Button asChild variant="outline">
                            <Link href={`/admin/patient/${patient.id}?tab=visits`}>Cancel</Link>
                        </Button>
                        <Button disabled={processing} type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
