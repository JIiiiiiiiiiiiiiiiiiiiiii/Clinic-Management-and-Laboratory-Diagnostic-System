import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Calendar, 
    Clock, 
    CheckCircle, 
    Circle, 
    ArrowRight, 
    FlaskConical,
    User,
    FileText
} from 'lucide-react';

interface VisitSequence {
    id: number;
    sequence_number: number;
    visit_type: 'initial' | 'lab_result_review' | 'follow_up';
    status: 'scheduled' | 'completed' | 'cancelled';
    scheduled_date: string;
    completed_date?: string;
    visit: {
        id: number;
        visit_code: string;
        purpose: string;
        status: string;
        patient: {
            first_name: string;
            last_name: string;
        };
    };
}

interface VisitSequenceTimelineProps {
    visitSequence: VisitSequence[];
    showDetails?: boolean;
    onVisitClick?: (visitId: number) => void;
}

export default function VisitSequenceTimeline({ 
    visitSequence, 
    showDetails = true,
    onVisitClick 
}: VisitSequenceTimelineProps) {
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'cancelled':
                return <Circle className="h-5 w-5 text-red-600" />;
            default:
                return <Circle className="h-5 w-5 text-blue-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            'completed': 'default',
            'cancelled': 'destructive',
            'scheduled': 'secondary'
        } as const;

        // Safety check for undefined or null status
        if (!status || typeof status !== 'string') {
            return (
                <Badge variant="secondary">
                    Unknown
                </Badge>
            );
        }

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getVisitTypeIcon = (visitType: string) => {
        switch (visitType) {
            case 'initial':
                return <User className="h-4 w-4" />;
            case 'lab_result_review':
                return <FlaskConical className="h-4 w-4" />;
            case 'follow_up':
                return <FileText className="h-4 w-4" />;
            default:
                return <Circle className="h-4 w-4" />;
        }
    };

    const getVisitTypeLabel = (visitType: string) => {
        switch (visitType) {
            case 'initial':
                return 'Initial Consultation';
            case 'lab_result_review':
                return 'Lab Results Review';
            case 'follow_up':
                return 'Follow-up Visit';
            default:
                return visitType;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Visit Sequence Timeline
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Complete patient journey from consultation to follow-up
                </p>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-4">
                    {visitSequence.map((sequence, index) => (
                        <div key={sequence.id} className="relative">
                            {/* Timeline Line */}
                            {index < visitSequence.length - 1 && (
                                <div className="absolute left-6 top-8 w-0.5 h-16 bg-gray-200"></div>
                            )}
                            
                            <div className="flex items-start space-x-4">
                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                    {getStatusIcon(sequence.status)}
                                </div>
                                
                                {/* Visit Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getVisitTypeIcon(sequence.visit_type)}
                                            <span className="font-medium text-sm">
                                                {getVisitTypeLabel(sequence.visit_type)}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                #{sequence.visit.visit_code}
                                            </Badge>
                                        </div>
                                        {getStatusBadge(sequence.status)}
                                    </div>
                                    
                                    {showDetails && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm text-gray-600">
                                                {sequence.visit.purpose}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {sequence.status === 'completed' && sequence.completed_date
                                                            ? `Completed ${formatDate(sequence.completed_date)}`
                                                            : `Scheduled ${formatDate(sequence.scheduled_date)}`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    <span>
                                                        {sequence.visit.patient.first_name} {sequence.visit.patient.last_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Action Button */}
                                    {onVisitClick && sequence.status !== 'cancelled' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => onVisitClick(sequence.visit.id)}
                                        >
                                            View Details
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Summary */}
                <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            Total Visits: {visitSequence.length}
                        </span>
                        <div className="flex items-center gap-4">
                            <span className="text-green-600">
                                Completed: {visitSequence.filter(s => s.status === 'completed').length}
                            </span>
                            <span className="text-blue-600">
                                Scheduled: {visitSequence.filter(s => s.status === 'scheduled').length}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
