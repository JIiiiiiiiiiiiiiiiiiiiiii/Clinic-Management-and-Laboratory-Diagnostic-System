import { ChartAreaInteractive } from '@/components/dashboard/ChartAreaInteractive';
import { SectionCards } from '@/components/dashboard/SectionCards';
import { SiteHeader } from '@/components/dashboard/SiteHeader';
import { DashboardCalendar } from '@/components/dashboard/DashboardCalendar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    const { dashboard } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="@container/main flex flex-1 flex-col gap-6">
                    <SectionCards />
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Main Content Area */}
                        <div className="xl:col-span-3 space-y-6">
                            <div className="px-2">
                                <ChartAreaInteractive />
                            </div>
                        </div>
                        
                        {/* Calendar Sidebar */}
                        <div className="xl:col-span-1">
                            <DashboardCalendar />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}