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
import { Calendar, Edit, ArrowLeft, Save, X, User, FileText } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Visits', href: '/admin/visits' },
    { title: 'Edit Visit', href: '#' },
];

interface VisitEditProps {
    visit: {
        id: number;
        visit_date: string;
        purpose: string;
        notes?: string;
        status: string;
        visit_type: string;
        patient: {
            patient_id: number;
            first_name: string;
            last_name: string;
            patient_no: string;
            sequence_number?: string;
        };
        staff: {
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

export default function VisitEdit({ visit, staff }: VisitEditProps) {
    const { hasPermission } = useRoleAccess();
    const [formData, setFormData] = useState({
        visit_date: visit.visit_date.split('T')[0] + 'T' + visit.visit_date.split('T')[1].substring(0, 5),
        purpose: visit.purpose,
        staff_id: visit.staff?.id?.toString() || '',
        status: visit.status,
        visit_type: visit.visit_type || 'initial',
        notes: visit.notes || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Map staff_id to doctor_id for backend compatibility
        const submitData = {
            ...formData,
            doctor_id: formData.staff_id,
        };
        // Remove staff_id and visit_type as they're not in the database
        delete submitData.staff_id;
        delete submitData.visit_type;

        router.put(`/admin/visits/${visit.id}`, submitData, {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Visit - ${visit.patient.first_name} ${visit.patient.last_name}`} />
            
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Edit className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-semibold text-black mb-4">Edit Visit</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {visit.patient.first_name} {visit.patient.last_name} - {visit.patient.patient_code || visit.patient.sequence_number || visit.patient.patient_no}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={`/admin/visits/${visit.id}`}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Visit
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Edit className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Visit Information</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="visit_date">Date & Time *</Label>
                                            <Input
                                                id="visit_date"
                                                type="datetime-local"
                                                value={formData.visit_date}
                                                onChange={(e) => handleInputChange('visit_date', e.target.value)}
                                                className={errors.visit_date ? 'border-red-500' : ''}
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

                                        <div className="space-y-2">
                                            <Label htmlFor="purpose">Purpose *</Label>
                                            <Input
                                                id="purpose"
                                                value={formData.purpose}
                                                onChange={(e) => handleInputChange('purpose', e.target.value)}
                                                className={errors.purpose ? 'border-red-500' : ''}
                                                placeholder="Enter visit purpose"
                                            />
                                            {errors.purpose && (
                                                <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status *</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => handleInputChange('status', value)}
                                            >
                                                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="visit_type">Visit Type *</Label>
                                            <Select
                                                value={formData.visit_type}
                                                onValueChange={(value) => handleInputChange('visit_type', value)}
                                            >
                                                <SelectTrigger className={errors.visit_type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="initial">Initial Visit</SelectItem>
                                                    <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                                                    <SelectItem value="lab_result_review">Lab Result Review</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.visit_type && (
                                                <p className="text-sm text-red-500 mt-1">{errors.visit_type}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            className={errors.notes ? 'border-red-500' : ''}
                                            placeholder="Enter any additional notes about this visit"
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
                                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        
                                        <Link href={`/admin/visits/${visit.id}`}>
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
                            {/* Patient Information */}
                            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Patient Information</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Patient Name</label>
                                        <p className="text-lg font-semibold mt-1">
                                            {visit.patient.first_name} {visit.patient.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Patient Number</label>
                                        <p className="text-lg font-semibold mt-1">{visit.patient.patient_code || visit.patient.sequence_number || visit.patient.patient_no}</p>
                                    </div>
                                </div>
                                
                                <div className="pt-6">
                                    <Link href={`/admin/patient/${visit.patient.patient_id}`}>
                                        <Button variant="outline" className="w-full">
                                            View Patient Profile
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                            {/* Current Staff */}
                            <Card className="holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">Current Staff</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Current Staff</label>
                                        <p className="font-semibold mt-1">{visit.staff?.name || 'No staff assigned'}</p>
                                        <p className="text-sm text-gray-500 capitalize">{visit.staff?.role || 'N/A'}</p>
                                    </div>
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
                                            <CardTitle className="text-lg font-semibold text-gray-900">Help</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div>
                                        <p className="font-medium"><strong>Visit Type:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                                            <li><strong>Initial:</strong> First visit for this appointment</li>
                                            <li><strong>Follow-up:</strong> Subsequent visit for monitoring</li>
                                            <li><strong>Lab Result Review:</strong> Review of laboratory results</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <p className="font-medium"><strong>Status:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                                            <li><strong>Scheduled:</strong> Visit is planned</li>
                                            <li><strong>In Progress:</strong> Visit is currently happening</li>
                                            <li><strong>Completed:</strong> Visit is finished</li>
                                            <li><strong>Cancelled:</strong> Visit was cancelled</li>
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
