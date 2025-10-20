<?php

namespace App\Exports\Hospital;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\PatientTransfer;
use App\Models\Supply\Supply as Inventory;
use App\Models\LabOrder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AllReportsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        $data = collect();

        // Add patients
        $patients = Patient::with(['appointments', 'transfers'])
            ->whereBetween('created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();

        foreach ($patients as $patient) {
            $data->push([
                'type' => 'Patient',
                'id' => $patient->patient_code,
                'name' => $patient->first_name . ' ' . $patient->last_name,
                'date' => $patient->created_at->format('Y-m-d H:i:s'),
                'status' => 'Active',
                'details' => 'Age: ' . ($patient->date_of_birth ? $patient->date_of_birth->age : 'N/A') . ', Sex: ' . $patient->sex,
                'count' => $patient->appointments->count() . ' appointments, ' . $patient->transfers->count() . ' transfers'
            ]);
        }

        // Add appointments
        $appointments = Appointment::with(['patient', 'doctor'])
            ->whereBetween('appointment_date', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();

        foreach ($appointments as $appointment) {
            $data->push([
                'type' => 'Appointment',
                'id' => $appointment->id,
                'name' => $appointment->patient ? $appointment->patient->first_name . ' ' . $appointment->patient->last_name : 'N/A',
                'date' => $appointment->appointment_date?->format('Y-m-d H:i:s'),
                'status' => $appointment->status,
                'details' => 'Doctor: ' . ($appointment->doctor ? $appointment->doctor->first_name . ' ' . $appointment->doctor->last_name : 'N/A'),
                'count' => $appointment->specialist_type
            ]);
        }

        // Add transfers
        $transfers = PatientTransfer::with(['patient', 'fromClinic', 'toClinic'])
            ->whereBetween('transfer_date', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();

        foreach ($transfers as $transfer) {
            $data->push([
                'type' => 'Transfer',
                'id' => $transfer->id,
                'name' => $transfer->patient ? $transfer->patient->first_name . ' ' . $transfer->patient->last_name : 'N/A',
                'date' => $transfer->transfer_date?->format('Y-m-d H:i:s'),
                'status' => $transfer->status,
                'details' => 'From: ' . ($transfer->fromClinic?->name ?? 'Hospital') . ' To: ' . ($transfer->toClinic?->name ?? 'Hospital'),
                'count' => $transfer->reason
            ]);
        }

        // Add transactions
        $transactions = BillingTransaction::with(['patient', 'appointment'])
            ->whereBetween('created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();

        foreach ($transactions as $transaction) {
            $data->push([
                'type' => 'Transaction',
                'id' => $transaction->id,
                'name' => $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 'N/A',
                'date' => $transaction->transaction_date?->format('Y-m-d H:i:s'),
                'status' => $transaction->status,
                'details' => 'Amount: ₱' . number_format($transaction->amount, 2) . ', Type: ' . $transaction->payment_type,
                'count' => 'Appointment: ' . $transaction->appointment_id
            ]);
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Type',
            'ID',
            'Name',
            'Date',
            'Status',
            'Details',
            'Additional Info'
        ];
    }

    public function map($item): array
    {
        return [
            $item['type'],
            $item['id'],
            $item['name'],
            $item['date'],
            $item['status'],
            $item['details'],
            $item['count']
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15,
            'B' => 15,
            'C' => 25,
            'D' => 20,
            'E' => 15,
            'F' => 40,
            'G' => 30,
        ];
    }
}
