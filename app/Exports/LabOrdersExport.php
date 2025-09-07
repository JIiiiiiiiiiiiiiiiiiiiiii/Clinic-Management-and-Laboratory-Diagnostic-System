<?php

namespace App\Exports;

use App\Models\LabOrder;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class LabOrdersExport implements FromArray, WithHeadings
{
    public function array(): array
    {
        $orders = LabOrder::with(['patient', 'labTests'])->latest()->get();

        return $orders->map(function (LabOrder $order) {
            $patient = $order->patient;
            return [
                'Order ID' => $order->id,
                'Status' => $order->status,
                'Patient No' => $patient?->id,
                'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                'Tests' => $order->labTests->pluck('name')->join(', '),
                'Ordered At' => optional($order->created_at)->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }

    public function headings(): array
    {
        return ['Order ID', 'Status', 'Patient No', 'Patient Name', 'Tests', 'Ordered At'];
    }
}


