import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { HospitalSidebar } from '@/components/hospital-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PatientSidebar } from '@/components/patient-sidebar';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { isPatient } = useRoleAccess();
    const { url } = usePage();
    
    // Check if user is on hospital routes
    const isHospitalRoute = url.startsWith('/hospital');

    return (
        <AppShell variant="sidebar">
            {isPatient ? <PatientSidebar /> : isHospitalRoute ? <HospitalSidebar /> : <AppSidebar />}
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
