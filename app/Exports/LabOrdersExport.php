<?php

namespace App\Exports;

use App\Models\LabOrder;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Collection;

class LabOrdersExport extends BaseExport implements FromArray, WithHeadings
{
    public function __construct()
    {
        parent::__construct('Lab Orders');
    }

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

    public function collection(): Collection
    {
        $orders = LabOrder::with(['patient', 'labTests'])->latest()->get();

        return $orders->map(function (LabOrder $order) {
            $patient = $order->patient;
            return (object) [
                'Order ID' => $order->id,
                'Status' => $order->status,
                'Patient No' => $patient?->id,
                'Patient Name' => $patient ? ($patient->last_name . ', ' . $patient->first_name) : 'N/A',
                'Tests' => $order->labTests->pluck('name')->join(', '),
                'Ordered At' => optional($order->created_at)->format('Y-m-d H:i:s'),
            ];
        });
    }
}


