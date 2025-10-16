import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    TrendingUp, 
    TrendingDown, 
    Users, 
    Calendar, 
    FlaskConical, 
    Package2,
    DollarSign,
    Activity
} from 'lucide-react';

interface MetricCard {
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease';
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const metrics: MetricCard[] = [
    {
        title: "Total Revenue",
        value: "₱45,231.89",
        change: "+20.1%",
        changeType: "increase",
        icon: DollarSign,
        description: "from last month"
    },
    {
        title: "Active Patients",
        value: "2,350",
        change: "+180.1%",
        changeType: "increase",
        icon: Users,
        description: "from last month"
    },
    {
        title: "Lab Tests",
        value: "12,234",
        change: "+19%",
        changeType: "increase",
        icon: FlaskConical,
        description: "from last month"
    },
    {
        title: "Appointments",
        value: "573",
        change: "+201",
        changeType: "increase",
        icon: Calendar,
        description: "since last hour"
    },
    {
        title: "Inventory Items",
        value: "1,234",
        change: "-12%",
        changeType: "decrease",
        icon: Package2,
        description: "from last month"
    },
    {
        title: "System Uptime",
        value: "99.9%",
        change: "+0.1%",
        changeType: "increase",
        icon: Activity,
        description: "from last month"
    }
];

export function SectionCards() {
    return (
        <div className="px-4 lg:px-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {metrics.map((metric, index) => (
                    <Card key={index} className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {metric.title}
                            </CardTitle>
                            <metric.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                {metric.changeType === 'increase' ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                                    {metric.change}
                                </span>
                                <span className="text-gray-500">{metric.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

