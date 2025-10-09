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
import { CustomDatePicker } from '@/components/ui/date-picker';
import { PatientPageLayout, PatientActionButton, PatientInfoCard } from '@/components/patient/PatientPageLayout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Calendar, Stethoscope, Heart, Activity, Clock, User, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

const buildBreadcrumbs = (patientId: number): BreadcrumbItem[] => [
    { title: 'Patient Management', href: '/admin/patient' },
    { title: 'Patient Details', href: `/admin/patient/${patientId}` },
    { title: 'New Visit', href: `/admin/patient/${patientId}/visits/create` },
];

type Doctor = { id: number; name: string };

interface CreateVisitProps {
    patient: PatientItem;
    doctors: Doctor[];
}

export default function CreateVisit({ patient, doctors }: CreateVisitProps) {
    const { data, setData, processing, errors, reset } = useForm({
        // Arrival Information
        arrival_date: '',
        arrival_time: '',
        mode_of_arrival: '',

        // Visit Details
        attending_physician: '',
        reason_for_consult: '',
        time_seen: '',

        // Vital Signs
        blood_pressure: '',
        heart_rate: '',
        respiratory_rate: '',
        temperature: '',
        weight_kg: 0,
        height_cm: 0,
        pain_assessment_scale: '',
        oxygen_saturation: '',

        // Medical Assessment
        history_of_present_illness: '',
        pertinent_physical_findings: '',
        plan_management: '',
        assessment_diagnosis: '',
        lmp: '',

        // Visit Status
        status: 'active' as 'active' | 'completed' | 'discharged',
        notes: '',
    });

    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);

    // Autofill arrival date/time on mount using local time
    useEffect(() => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        if (!data.arrival_date) setData('arrival_date', date);
        if (!data.arrival_time) setData('arrival_time', time);
        if (!data.time_seen) setData('time_seen', time);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        // Client-side required validation
        const requiredChecks: Array<{ key: string; label: string; isValid: (v: any) => boolean }> = [
            { key: 'arrival_date', label: 'Arrival Date', isValid: (v) => Boolean(v) },
            { key: 'arrival_time', label: 'Arrival Time', isValid: (v) => Boolean(v) },
            { key: 'attending_physician', label: 'Attending Physician', isValid: (v) => Boolean(v) },
            { key: 'time_seen', label: 'Time Seen', isValid: (v) => Boolean(v) },
        ];
        const missing = requiredChecks.filter((c) => !c.isValid((data as any)[c.key]));
        if (missing.length > 0) {
            setMissingFields(missing.map((m) => m.label));
            setShowMissingModal(true);
            const firstKey = missing[0].key as string;
            const el = document.getElementById(firstKey);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus();
            return;
        }

        router.post(
            `/admin/patient/${patient.id}/visits`,
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
            <Head title={`New Visit - ${patient.first_name} ${patient.last_name}`} />
            <PatientPageLayout
                title="New Visit"
                description={`${patient.first_name} ${patient.last_name} - Patient No: ${patient.patient_no}`}
                icon={<Plus className="h-6 w-6 text-black" />}
                actions={
                    <PatientActionButton
                        variant="outline"
                        icon={<ArrowLeft className="h-4 w-4" />}
                        label="Back to Patient"
                        href={`/admin/patient/${patient.id}?tab=visits`}
                        className="hover:bg-gray-50"
                    />
                }
            >

                {/* Error alert */}
                {((usePage().props as any).flash?.error as string | undefined) && (
                    <div className="rounded-md border border-gray-300 bg-gray-50 p-4 text-sm text-black">
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

                <form onSubmit={submit} className="space-y-8">
                    {/* Arrival Information */}
                    <PatientInfoCard
                        title="Arrival Information"
                        icon={<Calendar className="h-5 w-5 text-black" />}
                    >
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-3">
                                <Label htmlFor="arrival_date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Arrival Date *
                                </Label>
                                <CustomDatePicker
                                    value={data.arrival_date}
                                    onChange={(date) => setData('arrival_date', date ? date.toISOString().split('T')[0] : '')}
                                    placeholder="Select arrival date"
                                    variant="responsive"
                                    className={`w-full ${errors.arrival_date ? 'border-gray-500' : ''}`}
                                />
                                {errors.arrival_date && <p className="text-sm text-black">{errors.arrival_date}</p>}
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="arrival_time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Arrival Time *
                                </Label>
                                <Input
                                    id="arrival_time"
                                    type="time"
                                    value={data.arrival_time}
                                    onChange={(e) => setData('arrival_time', e.target.value)}
                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.arrival_time ? 'border-gray-500' : ''}`}
                                />
                                {errors.arrival_time && <p className="text-sm text-black">{errors.arrival_time}</p>}
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="mode_of_arrival" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Mode of Arrival
                                </Label>
                                <Input
                                    id="mode_of_arrival"
                                    value={data.mode_of_arrival}
                                    onChange={(e) => setData('mode_of_arrival', e.target.value)}
                                    placeholder="e.g., Ambulance, Walk-in, Private vehicle"
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                    </PatientInfoCard>

                    {/* Visit Details */}
                    <PatientInfoCard
                        title="Visit Details"
                        icon={<Stethoscope className="h-5 w-5 text-black" />}
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label htmlFor="attending_physician" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5" />
                                    Attending Physician *
                                </Label>
                                {doctors.length > 0 ? (
                                    <Select
                                        onValueChange={(value: string) => setData('attending_physician', value)}
                                        defaultValue={data.attending_physician || undefined}
                                    >
                                        <SelectTrigger id="attending_physician" className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.attending_physician ? 'border-gray-500' : ''}`}>
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
                                        className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.attending_physician ? 'border-gray-500' : ''}`}
                                    />
                                )}
                                {errors.attending_physician && <p className="text-sm text-black">{errors.attending_physician}</p>}
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="time_seen" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Time Seen *
                                </Label>
                                <Input
                                    id="time_seen"
                                    type="time"
                                    value={data.time_seen}
                                    onChange={(e) => setData('time_seen', e.target.value)}
                                    className={`h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm ${errors.time_seen ? 'border-gray-500' : ''}`}
                                />
                                {errors.time_seen && <p className="text-sm text-black">{errors.time_seen}</p>}
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="space-y-3">
                                <Label htmlFor="reason_for_consult" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Reason for Consult
                                </Label>
                                <Textarea
                                    id="reason_for_consult"
                                    value={data.reason_for_consult}
                                    onChange={(e) => setData('reason_for_consult', e.target.value)}
                                    placeholder="Primary reason for seeking medical attention"
                                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                    </PatientInfoCard>

                    {/* Vital Signs */}
                    <PatientInfoCard
                        title="Vital Signs"
                        icon={<Heart className="h-5 w-5 text-black" />}
                    >
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="blood_pressure" className="text-sm font-semibold text-gray-700">Blood Pressure</Label>
                                <Input
                                    id="blood_pressure"
                                    value={data.blood_pressure}
                                    onChange={(e) => setData('blood_pressure', e.target.value)}
                                    placeholder="e.g., 120/80"
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="heart_rate" className="text-sm font-semibold text-gray-700">Heart Rate</Label>
                                <Input
                                    id="heart_rate"
                                    value={data.heart_rate}
                                    onChange={(e) => setData('heart_rate', e.target.value)}
                                    placeholder="bpm"
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="respiratory_rate" className="text-sm font-semibold text-gray-700">Respiratory Rate</Label>
                                <Input
                                    id="respiratory_rate"
                                    value={data.respiratory_rate}
                                    onChange={(e) => setData('respiratory_rate', e.target.value)}
                                    placeholder="breaths/min"
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="temperature" className="text-sm font-semibold text-gray-700">Temperature</Label>
                                <Input
                                    id="temperature"
                                    value={data.temperature}
                                    onChange={(e) => setData('temperature', e.target.value)}
                                    placeholder="°C"
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="mt-6 grid gap-6 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight_kg" className="text-sm font-semibold text-gray-700">Weight (kg)</Label>
                                <Input
                                    id="weight_kg"
                                    type="number"
                                    step="0.1"
                                    value={data.weight_kg}
                                    onChange={(e) => setData('weight_kg', Number(e.target.value))}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height_cm" className="text-sm font-semibold text-gray-700">Height (cm)</Label>
                                <Input
                                    id="height_cm"
                                    type="number"
                                    step="0.1"
                                    value={data.height_cm}
                                    onChange={(e) => setData('height_cm', Number(e.target.value))}
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pain_assessment_scale" className="text-sm font-semibold text-gray-700">Pain Assessment Scale</Label>
                                <Input
                                    id="pain_assessment_scale"
                                    value={data.pain_assessment_scale}
                                    onChange={(e) => setData('pain_assessment_scale', e.target.value)}
                                    placeholder="0-10"
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="oxygen_saturation" className="text-sm font-semibold text-gray-700">O2 Saturation</Label>
                                <Input
                                    id="oxygen_saturation"
                                    value={data.oxygen_saturation}
                                    onChange={(e) => setData('oxygen_saturation', e.target.value)}
                                    placeholder="%"
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                    </PatientInfoCard>

                    {/* Medical Assessment */}
                    <PatientInfoCard
                        title="Medical Assessment"
                        icon={<Activity className="h-5 w-5 text-black" />}
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="history_of_present_illness" className="text-sm font-semibold text-gray-700">History of Present Illness</Label>
                                <Textarea
                                    id="history_of_present_illness"
                                    value={data.history_of_present_illness}
                                    onChange={(e) => setData('history_of_present_illness', e.target.value)}
                                    placeholder="Detailed history of current symptoms"
                                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pertinent_physical_findings" className="text-sm font-semibold text-gray-700">Pertinent Physical Findings</Label>
                                <Textarea
                                    id="pertinent_physical_findings"
                                    value={data.pertinent_physical_findings}
                                    onChange={(e) => setData('pertinent_physical_findings', e.target.value)}
                                    placeholder="Physical examination findings"
                                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="plan_management" className="text-sm font-semibold text-gray-700">Plan/Management</Label>
                                <Textarea
                                    id="plan_management"
                                    value={data.plan_management}
                                    onChange={(e) => setData('plan_management', e.target.value)}
                                    placeholder="Treatment plan and management"
                                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assessment_diagnosis" className="text-sm font-semibold text-gray-700">Assessment/Diagnosis</Label>
                                <Textarea
                                    id="assessment_diagnosis"
                                    value={data.assessment_diagnosis}
                                    onChange={(e) => setData('assessment_diagnosis', e.target.value)}
                                    placeholder="Clinical assessment and diagnosis"
                                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lmp" className="text-sm font-semibold text-gray-700">Last Menstrual Period (LMP)</Label>
                                <Input
                                    id="lmp"
                                    value={data.lmp}
                                    onChange={(e) => setData('lmp', e.target.value)}
                                    placeholder="Date of last period"
                                    className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                    </PatientInfoCard>

                    {/* Visit Status */}
                    <PatientInfoCard
                        title="Visit Status"
                        icon={<Clock className="h-5 w-5 text-black" />}
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Status *</Label>
                                <Select onValueChange={(value: any) => setData('status', value)} defaultValue={data.status}>
                                    <SelectTrigger id="status" className="h-12 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm">
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
                                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional notes about this visit"
                                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                    </PatientInfoCard>

                    <div className="flex items-center justify-end gap-4 pt-6">
                        <PatientActionButton
                            variant="outline"
                            icon={<ArrowLeft className="h-4 w-4" />}
                            label="Cancel"
                            href={`/admin/patient/${patient.id}?tab=visits`}
                            className="px-8 py-4 h-14 border-gray-300 hover:bg-gray-50 rounded-xl text-lg font-semibold"
                        />
                        <Button 
                            disabled={processing} 
                            type="submit"
                            className="bg-gray-600 hover:bg-gray-700blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 h-14 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-lg font-semibold"
                        >
                            <Save className="mr-3 h-6 w-6" />
                            {processing ? 'Recording...' : 'Record Visit'}
                        </Button>
                    </div>
                </form>
            </PatientPageLayout>
        </AppLayout>
    );
}
