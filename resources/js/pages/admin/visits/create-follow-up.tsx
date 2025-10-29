import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ArrowRight, ArrowLeft, Save, X, User, Stethoscope, FileText } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Patient Management', href: '/admin/patient' },
    { title: 'Visits', href: '/admin/visits' },
    { title: 'Create Follow-up', href: '#' },
];

interface CreateFollowUpProps {
    original_visit: {
        id: number;
        visit_date_time_time: string;
        purpose: string;
        notes?: string;
        patient: {
            id: number;
            first_name: string;
            last_name: string;
            patient_no: string;
            sequence_number?: string;
        };
        attending_staff: {
            id: number;
            name: string;
            role: string;
        };
    };
    staff: Array<{
        id: number;
        name: string;
        role: string;
    }>;
}

export default function CreateFollowUp({ original_visit, staff }: CreateFollowUpProps) {
    const { hasPermission } = useRoleAccess();
    const [formData, setFormData] = useState({
        visit_date: '',
        purpose: `Follow-up: ${original_visit.purpose}`,
        staff_id: original_visit.attending_staff?.id?.toString() || '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Map staff_id to doctor_id for backend compatibility
        const submitData = {
            visit_date: formData.visit_date,
            purpose: formData.purpose,
            doctor_id: formData.staff_id,
            notes: formData.notes,
        };

        router.post(`/admin/visits/${original_visit.id}/follow-up`, submitData, {
            onSuccess: () => {
                // Success handled by controller redirect
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Follow-up Visit - ${original_visit.patient.first_name} ${original_visit.patient.last_name}`} />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <ArrowRight className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Create Follow-up Visit</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {original_visit.patient.first_name} {original_visit.patient.last_name} - {original_visit.patient.patient_no}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={`/admin/visits/${original_visit.id}`}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Visit
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Follow-up Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Follow-up Visit Information</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="visit_date">Follow-up Date & Time *</Label>
                                            <Input
                                                id="visit_date"
                                                type="datetime-local"
                                                value={formData.visit_date}
                                                onChange={(e) => handleInputChange('visit_date', e.target.value)}
                                                className={errors.visit_date ? 'border-red-500' : ''}
                                                min={new Date().toISOString().slice(0, 16)}
                                            />
                                            {errors.visit_date && (
                                                <p className="text-sm text-red-500 mt-1">{errors.visit_date}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="staff_id">Attending Staff *</Label>
                                            <Select
                                                value={formData.staff_id}
                                                onValueChange={(value) => handleInputChange('staff_id', value)}
                                            >
                                                <SelectTrigger className={errors.staff_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select staff" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {staff.map((s) => (
                                                        <SelectItem key={s.id} value={s.id.toString()}>
                                                            {s.name} ({s.role})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.staff_id && (
                                                <p className="text-sm text-red-500 mt-1">{errors.staff_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="purpose">Purpose *</Label>
                                        <Input
                                            id="purpose"
                                            value={formData.purpose}
                                            onChange={(e) => handleInputChange('purpose', e.target.value)}
                                            className={errors.purpose ? 'border-red-500' : ''}
                                            placeholder="Enter follow-up purpose"
                                        />
                                        {errors.purpose && (
                                            <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            className={errors.notes ? 'border-red-500' : ''}
                                            placeholder="Enter any additional notes for the follow-up visit"
                                            rows={4}
                                        />
                                        {errors.notes && (
                                            <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                        <Button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSubmitting ? 'Creating...' : 'Create Follow-up Visit'}
                                        </Button>
                                        
                                        <Link href={`/admin/visits/${original_visit.id}`}>
                                            <Button type="button" variant="outline" className="flex items-center gap-2">
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Original Visit Information */}
                            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Original Visit</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Date & Time</label>
                                        <p className="font-semibold">{formatDateTime(original_visit.visit_date_time_time)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Purpose</label>
                                        <p className="font-semibold">{original_visit.purpose}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Staff</label>
                                        <p className="font-semibold">{original_visit.attending_staff?.name || 'No staff assigned'}</p>
                                        <p className="text-sm text-gray-500 capitalize">{original_visit.attending_staff?.role || 'N/A'}</p>
                                    </div>
                                    {original_visit.notes && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-500">Notes</label>
                                            <p className="text-sm bg-gray-50 p-3 rounded">{original_visit.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                            {/* Patient Information */}
                            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Patient Information</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Patient Name</label>
                                        <p className="text-lg font-semibold">
                                            {original_visit.patient.first_name} {original_visit.patient.last_name}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-500">Patient Number</label>
                                        <p className="text-lg font-semibold">{original_visit.patient.patient_no}</p>
                                    </div>
                                </div>
                                
                                <div className="pt-6">
                                    <Link href={`/admin/patient/${original_visit.patient.id}`}>
                                        <Button variant="outline" className="w-full">
                                            View Patient Profile
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                            {/* Help Text */}
                            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Follow-up Guidelines</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <div>
                                        <p className="font-medium"><strong>When to create follow-up visits:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                                            <li>Doctor needs to monitor patient recovery</li>
                                            <li>Lab results need review by med tech</li>
                                            <li>Medication adjustment required</li>
                                            <li>Progress check after treatment</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <p className="font-medium"><strong>Best practices:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                                            <li>Schedule follow-up 1-2 weeks after initial visit</li>
                                            <li>Use same staff member when possible</li>
                                            <li>Be specific about follow-up purpose</li>
                                            <li>Include relevant notes from original visit</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
