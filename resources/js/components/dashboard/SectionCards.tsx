import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Users, 
    Calendar, 
    FlaskConical, 
    Package2
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface MetricCard {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
}

export function SectionCards() {
    const { dashboard } = usePage().props as any;
    
    const metrics: MetricCard[] = [
        {
            title: "Total Patients",
            value: dashboard?.stats?.total_patients?.toString() || "0",
            icon: Users
        },
        {
            title: "Total Appointments", 
            value: dashboard?.stats?.total_appointments?.toString() || "0",
            icon: Calendar
        },
        {
            title: "Total Lab Orders",
            value: dashboard?.totals?.labOrders?.toString() || "0", 
            icon: FlaskConical
        },
        {
            title: "Low Stock",
            value: dashboard?.totals?.lowStockSupplies?.toString() || "0",
            icon: Package2
        }
    ];

    return (
        <div className="px-4 lg:px-6 w-full min-w-0">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
                {metrics.map((metric, index) => (
                    <Card key={index} className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all w-full min-w-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {metric.title}
                            </CardTitle>
                            <metric.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}