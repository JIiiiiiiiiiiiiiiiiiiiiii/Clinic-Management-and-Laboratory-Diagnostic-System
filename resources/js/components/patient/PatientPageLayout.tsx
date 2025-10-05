import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { 
    Users, Activity, TrendingUp, CheckCircle, Calendar, 
    User, Phone, Mail, MapPin, Clock, Stethoscope, 
    Edit, Eye, Plus, Search, Filter, ArrowLeft, Save,
    Heart, Shield, FileText, AlertCircle, XCircle
} from 'lucide-react';

interface PatientPageLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    icon?: React.ReactNode;
    breadcrumbs?: Array<{ title: string; href: string }>;
    actions?: React.ReactNode;
    stats?: {
        totalPatients?: number;
        activeVisits?: number;
        completedVisits?: number;
        newThisMonth?: number;
    };
}

export function PatientPageLayout({ 
    children, 
    title, 
    description, 
    icon, 
    actions,
    stats 
}: PatientPageLayoutProps) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="@container/main flex flex-1 flex-col gap-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {icon && (
                            <div className="p-3 bg-blue-100 rounded-xl">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            {description && (
                                <p className="text-sm text-gray-600 mt-1">{description}</p>
                            )}
                        </div>
                    </div>
                    {actions && (
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
                                <Users className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.totalPatients || 0}</div>
                                <p className="text-xs text-gray-500">Registered patients</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Active Visits</CardTitle>
                                <Activity className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.activeVisits || 0}</div>
                                <p className="text-xs text-gray-500">Currently in clinic</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                                <CheckCircle className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.completedVisits || 0}</div>
                                <p className="text-xs text-gray-500">Visits completed</p>
                            </CardContent>
                        </Card>

                        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/70 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">New This Month</CardTitle>
                                <TrendingUp className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{stats.newThisMonth || 0}</div>
                                <p className="text-xs text-gray-500">New registrations</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Content */}
                {children}
            </div>
        </div>
    );
}

// Shared Button Components with Labels
export function PatientActionButton({ 
    variant = "default", 
    size = "default", 
    icon, 
    label, 
    onClick, 
    href,
    className = "",
    disabled = false 
}: {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
    className?: string;
    disabled?: boolean;
}) {
    const buttonContent = (
        <>
            {icon}
            <span className="ml-2">{label}</span>
        </>
    );

    if (href) {
        return (
            <Button asChild variant={variant} size={size} className={className} disabled={disabled}>
                <Link href={href}>
                    {buttonContent}
                </Link>
            </Button>
        );
    }

    return (
        <Button 
            variant={variant} 
            size={size} 
            onClick={onClick} 
            className={className}
            disabled={disabled}
        >
            {buttonContent}
        </Button>
    );
}

// Shared Card Components
export function PatientInfoCard({ 
    title, 
    icon, 
    children, 
    className = "" 
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={`holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300 ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        {icon}
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}

// Shared Form Section Component
export function PatientFormSection({ 
    title, 
    description, 
    icon, 
    children, 
    className = "" 
}: {
    title: string;
    description?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={`holographic-card shadow-lg overflow-hidden rounded-xl bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all duration-300 ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        {icon}
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}

// Shared Status Badge Component
export function PatientStatusBadge({ 
    status, 
    variant = "default" 
}: {
    status: string;
    variant?: "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline";
}) {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return { 
                    variant: 'default' as const, 
                    className: 'bg-green-100 text-green-800 border-green-200',
                    icon: <CheckCircle className="w-3 h-3 mr-1" />
                };
            case 'completed':
                return { 
                    variant: 'default' as const, 
                    className: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: <CheckCircle className="w-3 h-3 mr-1" />
                };
            case 'discharged':
                return { 
                    variant: 'destructive' as const, 
                    className: 'bg-red-100 text-red-800 border-red-200',
                    icon: <XCircle className="w-3 h-3 mr-1" />
                };
            case 'pending':
                return { 
                    variant: 'secondary' as const, 
                    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <AlertCircle className="w-3 h-3 mr-1" />
                };
            default:
                return { 
                    variant: 'outline' as const, 
                    className: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: null
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Badge variant={config.variant} className={config.className}>
            {config.icon}
            {status}
        </Badge>
    );
}

export default PatientPageLayout;
