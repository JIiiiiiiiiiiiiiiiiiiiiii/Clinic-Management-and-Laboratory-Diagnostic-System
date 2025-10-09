import { Head } from '@inertiajs/react';

interface MinimalDashboardProps {
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

export default function MinimalDashboard({ user, patient }: MinimalDashboardProps) {
    return (
        <>
            <Head title="Minimal Dashboard" />
            <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Patient Dashboard
                </h1>
                
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '0.5rem', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginBottom: '1rem'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                        Patient Information
                    </h2>
                    <p><strong>Name:</strong> {patient.first_name} {patient.last_name}</p>
                    <p><strong>Patient ID:</strong> {patient.patient_no}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>

                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '0.5rem', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                        Quick Actions
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a 
                            href="/patient/appointments" 
                            style={{ 
                                backgroundColor: '#3b82f6', 
                                color: 'white', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '0.25rem', 
                                textDecoration: 'none'
                            }}
                        >
                            View Appointments
                        </a>
                        <a 
                            href="/patient/appointments/create" 
                            style={{ 
                                backgroundColor: '#10b981', 
                                color: 'white', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '0.25rem', 
                                textDecoration: 'none'
                            }}
                        >
                            Book Appointment
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
