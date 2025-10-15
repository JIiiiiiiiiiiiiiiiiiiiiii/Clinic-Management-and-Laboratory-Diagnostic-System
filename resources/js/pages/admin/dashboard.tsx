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
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards />
                        <div className="px-4 lg:px-6">
                            <ChartAreaInteractive />
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 px-4 lg:px-6">
                            {/* Calendar Sidebar */}
                            <div className="xl:col-span-1">
                                <DashboardCalendar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}