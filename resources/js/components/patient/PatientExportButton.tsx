import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import PatientExportModal from './PatientExportModal';

interface PatientExportButtonProps {
    patientId?: number;
    patientName?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'default' | 'lg';
    className?: string;
}

export default function PatientExportButton({ patientId, patientName, variant = 'outline', size = 'sm', className = '' }: PatientExportButtonProps) {
    return (
        <PatientExportModal
            patientId={patientId}
            patientName={patientName}
            trigger={
                <Button
                    variant={variant}
                    size={size}
                    className={`border-gray-300 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md ${className}`}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            }
        />
    );
}
