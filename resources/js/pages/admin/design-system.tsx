import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    Save, 
    X, 
    Trash2, 
    Check, 
    AlertTriangle, 
    Info, 
    Download,
    Plus,
    Edit,
    Eye
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Design System',
        href: '/admin/design-system',
    },
];

export default function DesignSystem() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Design System - St. James Hospital" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header */}
                <div>
                    <h1>Design System</h1>
                    <p className="text-muted-foreground">
                        Comprehensive design system for St. James Hospital Clinic Management System
                    </p>
                </div>

                {/* Typography Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Typography</CardTitle>
                        <CardDescription>
                            Professional font hierarchy with Roboto (UI) and Georgia (clinical text)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h1>H1 - Main Page Title (24px, Bold)</h1>
                            <h2>H2 - Section Header (20px, Semi-bold)</h2>
                            <h3>H3 - Subsection Header (18px, Semi-bold)</h3>
                            <h4>H4 - Minor Header (16px, Medium)</h4>
                            <p>Body Text - Standard content (16px, Regular)</p>
                            <p className="text-small">Small Text - Labels and captions (14px)</p>
                            <p className="text-large">Large Text - Emphasis (18px)</p>
                        </div>
                        <div className="clinical-text">
                            <h3>Clinical Text (Serif Font)</h3>
                            <p>This is clinical text using Georgia serif font for better readability in medical forms and reports. The serif font provides excellent readability for long-form medical content.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Button System */}
                <Card>
                    <CardHeader>
                        <CardTitle>Button System</CardTitle>
                        <CardDescription>
                            Consistent button colors that communicate action and urgency
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3>Primary Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button>
                                    <Save className="h-4 w-4" />
                                    Save
                                </Button>
                                <Button>
                                    <Plus className="h-4 w-4" />
                                    Create New
                                </Button>
                                <Button>
                                    <Check className="h-4 w-4" />
                                    Submit
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3>Secondary Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="secondary">
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                                <Button variant="ghost">
                                    <Eye className="h-4 w-4" />
                                    View
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3>Status Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="success">
                                    <Check className="h-4 w-4" />
                                    Approve
                                </Button>
                                <Button variant="warning">
                                    <AlertTriangle className="h-4 w-4" />
                                    Pending
                                </Button>
                                <Button variant="info">
                                    <Info className="h-4 w-4" />
                                    Info
                                </Button>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3>Button Sizes</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button size="sm">Small</Button>
                                <Button size="default">Default</Button>
                                <Button size="lg">Large</Button>
                                <Button size="icon">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Badge System */}
                <Card>
                    <CardHeader>
                        <CardTitle>Badge System</CardTitle>
                        <CardDescription>
                            Status indicators with semantic colors for immediate recognition
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3>Status Badges</h3>
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="success">Complete</Badge>
                                <Badge variant="success">Active</Badge>
                                <Badge variant="success">Approved</Badge>
                                <Badge variant="warning">Pending</Badge>
                                <Badge variant="warning">Awaiting Approval</Badge>
                                <Badge variant="info">New</Badge>
                                <Badge variant="info">In Progress</Badge>
                                <Badge variant="active">Current</Badge>
                                <Badge variant="destructive">Urgent</Badge>
                                <Badge variant="destructive">Error</Badge>
                                <Badge variant="destructive">Failed</Badge>
                            </div>
                        </div>

                        <div>
                            <h3>Other Variants</h3>
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="default">Default</Badge>
                                <Badge variant="secondary">Secondary</Badge>
                                <Badge variant="outline">Outline</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Color System */}
                <Card>
                    <CardHeader>
                        <CardTitle>Color System</CardTitle>
                        <CardDescription>
                            Semantic colors with specific purposes for clinic operations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <div className="h-16 w-full bg-success rounded-md flex items-center justify-center text-success-foreground font-medium">
                                    Success
                                </div>
                                <p className="text-sm text-muted-foreground">Complete, Active, Approved</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 w-full bg-warning rounded-md flex items-center justify-center text-warning-foreground font-medium">
                                    Warning
                                </div>
                                <p className="text-sm text-muted-foreground">Pending, Awaiting Approval</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 w-full bg-info rounded-md flex items-center justify-center text-info-foreground font-medium">
                                    Info
                                </div>
                                <p className="text-sm text-muted-foreground">New, In Progress</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-16 w-full bg-destructive rounded-md flex items-center justify-center text-white font-medium">
                                    Danger
                                </div>
                                <p className="text-sm text-muted-foreground">Urgent, Error, Failed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Interactive States */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interactive States</CardTitle>
                        <CardDescription>
                            Hover and click feedback for all interactive elements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3>Hover States</h3>
                                <p className="text-muted-foreground mb-3">
                                    All buttons, badges, and sidebar icons have smooth hover transitions with color changes and shadow effects.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button>Hover me</Button>
                                    <Badge variant="success">Hover badge</Badge>
                                    <Button variant="outline">Hover outline</Button>
                                </div>
                            </div>
                            <div>
                                <h3>Active States</h3>
                                <p className="text-muted-foreground mb-3">
                                    Click feedback with scale animation and color changes to confirm user interaction.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button>Click me</Button>
                                    <Button variant="secondary">Click secondary</Button>
                                    <Button variant="destructive">Click danger</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Guidelines */}
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Guidelines</CardTitle>
                        <CardDescription>
                            Best practices for implementing the design system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3>Button Usage</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li><strong>Primary (default):</strong> Main actions like Save, Submit, Create</li>
                                <li><strong>Secondary:</strong> Cancel, Clear, Back actions</li>
                                <li><strong>Success:</strong> Approve, Confirm, Complete actions</li>
                                <li><strong>Warning:</strong> Caution actions that need attention</li>
                                <li><strong>Info:</strong> Information, Help, Details actions</li>
                                <li><strong>Destructive:</strong> Delete, Remove, Critical actions</li>
                            </ul>
                        </div>
                        <div>
                            <h3>Badge Usage</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li><strong>Success:</strong> Complete, Active, Approved statuses</li>
                                <li><strong>Warning:</strong> Pending, Awaiting Approval statuses</li>
                                <li><strong>Info:</strong> New, In Progress statuses</li>
                                <li><strong>Danger:</strong> Urgent, Error, Failed statuses</li>
                                <li><strong>Active:</strong> Current state indicators</li>
                            </ul>
                        </div>
                        <div>
                            <h3>Sidebar Navigation</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Active page icons use the active color to distinguish from inactive icons</li>
                                <li>Smooth transitions on hover and focus states</li>
                                <li>Consistent spacing and typography throughout</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
