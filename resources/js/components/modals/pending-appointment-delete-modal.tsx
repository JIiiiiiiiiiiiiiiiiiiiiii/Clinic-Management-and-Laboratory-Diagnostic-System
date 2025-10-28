import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    AlertTriangle,
    X,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface PendingAppointmentDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appointmentId: number | null;
    appointmentName?: string;
}

export default function PendingAppointmentDeleteModal({
    isOpen,
    onClose,
    onSuccess,
    appointmentId,
    appointmentName
}: PendingAppointmentDeleteModalProps) {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { delete: destroy, processing } = useForm();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        if (!appointmentId) {
            setValidationErrors(['No appointment ID provided']);
            return;
        }

        destroy(`/admin/billing/pending-appointments/${appointmentId}`, {
            onSuccess: () => {
                onSuccess();
                onClose();
            },
            onError: (errors: any) => {
                console.error('Delete failed:', errors);
                if (errors.errors) {
                    setValidationErrors(Object.values(errors.errors).flat());
                } else {
                    setValidationErrors([errors.message || 'Delete failed']);
                }
            },
        });
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-[500px] sm:max-w-none" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6 border-b bg-gradient-to-r from-red-50 to-white">
                    <div>
                        <DialogTitle className="text-2xl font-bold text-red-900 flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6" />
                            Delete Appointment
                        </DialogTitle>
                        <p className="text-red-600 mt-1 text-sm">
                            This action cannot be undone
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                            </div>
                            <ul className="text-sm text-red-700 list-disc list-inside">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Confirmation Message */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800 mb-2">
                                    Are you sure you want to delete this appointment?
                                </h3>
                                <div className="text-sm text-red-700">
                                    <p className="mb-2">
                                        <strong>Appointment ID:</strong> #{appointmentId}
                                    </p>
                                    {appointmentName && (
                                        <p>
                                            <strong>Patient:</strong> {appointmentName}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-red-600 mt-3 font-medium">
                                    This action will permanently remove the appointment from the system and cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Appointment
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
