import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    AlertTriangle,
    X,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';

interface AppointmentDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appointmentId: number | null;
    appointmentName?: string;
}

export default function AppointmentDeleteModal({
    isOpen,
    onClose,
    onSuccess,
    appointmentId,
    appointmentName
}: AppointmentDeleteModalProps) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!appointmentId) return;
        
        setProcessing(true);
        
        router.delete(`/admin/appointments/${appointmentId}`, {
            onSuccess: () => {
                onSuccess();
                onClose();
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[90vw] max-w-[400px] sm:max-w-none" hideCloseButton={true}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 pt-4 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            Delete Appointment
                        </DialogTitle>
                        <p className="text-gray-600 mt-1 text-sm">
                            This action cannot be undone
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-200">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-4 space-y-3">
                    {/* Warning Message */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">Are you sure you want to delete this appointment?</h3>
                                <p className="text-xs text-red-700 mt-1">
                                    {appointmentName ? `This will permanently delete the appointment for ${appointmentName}.` : 'This will permanently delete the appointment.'}
                                </p>
                                <p className="text-xs text-red-700 mt-1">
                                    <strong>Warning:</strong> This action will also delete any associated billing transactions and lab test results.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
