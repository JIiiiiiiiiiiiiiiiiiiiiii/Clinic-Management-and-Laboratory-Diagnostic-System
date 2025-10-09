import { Head } from '@inertiajs/react';

interface BasicDashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
    patient: {
        id: number;
        patient_no: string;
        first_name: string;
        last_name: string;
    };
}

export default function BasicDashboard({ user, patient }: BasicDashboardProps) {
    return (
        <>
            <Head title="Basic Dashboard" />
            <div className="min-h-screen bg-gray-50 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Basic Dashboard</h1>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
                    <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
                    <p><strong>Patient ID:</strong> {patient.patient_no}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            </div>
        </>
    );
}
