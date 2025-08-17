import PatientDataTable from '@/components/dashboard/PatientsDataTable';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PatientItem } from '@/types/patients';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Management',
        href: '/management/patient',
    },
];

export default function Patient({ patients }: { patients: PatientItem[] }) {
    console.log(patients);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PatientDataTable patients={patients} />
            </div>
        </AppLayout>
    );
}
