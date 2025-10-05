import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2,
    User,
    Calendar,
    FlaskConical
} from 'lucide-react';

interface PatientData {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
    lastVisit: string;
    nextAppointment: string;
    labTests: number;
}

// Mock data
const patients: PatientData[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@email.com',
        status: 'active',
        lastVisit: '2025-01-15',
        nextAppointment: '2025-01-20',
        labTests: 3
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        status: 'pending',
        lastVisit: '2025-01-10',
        nextAppointment: '2025-01-18',
        labTests: 1
    },
    {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob.johnson@email.com',
        status: 'active',
        lastVisit: '2025-01-14',
        nextAppointment: '2025-01-22',
        labTests: 2
    },
    {
        id: '4',
        name: 'Alice Brown',
        email: 'alice.brown@email.com',
        status: 'inactive',
        lastVisit: '2025-01-05',
        nextAppointment: '2025-01-25',
        labTests: 0
    },
    {
        id: '5',
        name: 'Charlie Wilson',
        email: 'charlie.wilson@email.com',
        status: 'active',
        lastVisit: '2025-01-13',
        nextAppointment: '2025-01-19',
        labTests: 4
    }
];

const getStatusBadge = (status: PatientData['status']) => {
    const config = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800'
    };
    return config[status];
};

export function DataTable({ data }: { data?: any[] }) {
    return (
        <Card className="holographic-card shadow-lg overflow-hidden rounded-lg bg-white/60 backdrop-blur-md border border-white/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Recent Patients</CardTitle>
                        <p className="text-sm text-gray-600">Latest patient registrations and updates</p>
                    </div>
                </div>
                <Button variant="outline" size="sm">
                    View All
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Visit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Next Appointment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lab Tests
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data || patients).map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                                <div className="text-sm text-gray-500">{patient.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={getStatusBadge(patient.status)}>
                                            {patient.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {patient.lastVisit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {patient.nextAppointment}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <FlaskConical className="h-4 w-4 mr-1 text-blue-500" />
                                            {patient.labTests}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
